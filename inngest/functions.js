import { inngest } from "./client";
import { db } from "@/lib/db";
import {
  chaptersTable,
  coursesTable,
  examsTable,
  flashcardsTable,
  quizQuestionsTable,
  quizzesTable,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { gemini } from "@/lib/gemini";
import { parseAiJson } from "@/lib/ai-json";
import {
  markGenerationJobCompleted,
  markGenerationJobFailed,
  markGenerationJobRunning,
} from "@/lib/generation-jobs";

class RetryableAiOutputError extends Error {
  constructor(message) {
    super(message);
    this.name = "RetryableAiOutputError";
  }
}

function getChapterSourceText(chapters) {
  if (!Array.isArray(chapters)) {
    throw new Error("Chapter data was missing.");
  }

  let sourceText = "";

  for (const chapter of chapters) {
    sourceText += `Chapter ${chapter.chapter_order}: ${chapter.title}\n`;
    sourceText += `${chapter.content}\n\n`;
  }

  return sourceText.trim();
}

function getRequiredText(value, fieldName) {
  if (typeof value !== "string") {
    throw new RetryableAiOutputError(`${fieldName} is missing.`);
  }

  const cleanValue = value.trim();

  if (!cleanValue) {
    throw new RetryableAiOutputError(`${fieldName} is missing.`);
  }

  return cleanValue;
}

function getOrder(value, fallbackOrder) {
  const order = Number(value);

  if (Number.isNaN(order)) {
    return fallbackOrder;
  }

  if (order < 1) {
    return fallbackOrder;
  }

  return order;
}

function getJsonConfig(responseSchema, maxOutputTokens = 8192) {
  const config = {
    responseMimeType: "application/json",
    temperature: 0.2,
    maxOutputTokens: maxOutputTokens,
  };

  if (responseSchema) {
    config.responseSchema = responseSchema;
  }

  return config;
}

function getTextConfig(maxOutputTokens = 8192) {
  return {
    temperature: 0.35,
    maxOutputTokens: maxOutputTokens,
  };
}

function getGeneratedText(response, fieldName) {
  const text = response.text;

  if (typeof text !== "string") {
    throw new RetryableAiOutputError(`${fieldName} was not returned.`);
  }

  const cleanText = text.trim();

  if (!cleanText) {
    throw new RetryableAiOutputError(`${fieldName} was empty.`);
  }

  return cleanText;
}

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const GEMINI_MAX_ATTEMPTS = 5;
const GEMINI_REQUEST_SPACING_MS = 13_000;
const GEMINI_RETRY_DELAY_SECONDS = [20, 45, 90, 180];
const RETRYABLE_AI_STATUS_CODES = [408, 429, 500, 502, 503, 504];
const RETRYABLE_AI_STATUSES = ["RESOURCE_EXHAUSTED", "UNAVAILABLE"];
const GEMINI_CONCURRENCY = {
  limit: 1,
  scope: "env",
  key: '"gemini-generation"',
};

function parseAiErrorPayload(error) {
  if (!error) {
    return null;
  }

  if (typeof error.message !== "string") {
    return null;
  }

  try {
    return JSON.parse(error.message);
  } catch {
    return null;
  }
}

function getAiErrorCode(error) {
  if (typeof error?.status === "number") {
    return error.status;
  }

  const payload = parseAiErrorPayload(error);
  const code = payload?.error?.code;

  if (typeof code === "number") {
    return code;
  }

  return null;
}

function getAiErrorStatus(error) {
  const payload = parseAiErrorPayload(error);
  const status = payload?.error?.status;

  if (typeof status === "string") {
    return status;
  }

  return "";
}

function getRetryInfoDelaySeconds(error) {
  const payload = parseAiErrorPayload(error);
  const details = payload?.error?.details;

  if (!Array.isArray(details)) {
    return null;
  }

  for (const detail of details) {
    const retryDelay = detail?.retryDelay;

    if (typeof retryDelay !== "string") {
      continue;
    }

    const secondsMatch = retryDelay.match(/^(\d+(?:\.\d+)?)s$/);

    if (secondsMatch) {
      return Math.ceil(Number(secondsMatch[1]));
    }
  }

  return null;
}

function isRetryableAiError(error) {
  if (
    error instanceof RetryableAiOutputError ||
    error?.name === "RetryableAiOutputError"
  ) {
    return true;
  }

  const code = getAiErrorCode(error);
  const status = getAiErrorStatus(error);

  if (RETRYABLE_AI_STATUS_CODES.includes(code)) {
    return true;
  }

  if (RETRYABLE_AI_STATUSES.includes(status)) {
    return true;
  }

  const message = String(error?.message ?? "");
  const hasRetryableNetworkError =
    message.includes("fetch failed") ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT") ||
    message.includes("socket hang up");

  if (hasRetryableNetworkError) {
    return true;
  }

  return false;
}

function parseGeneratedJson(rawText) {
  try {
    return parseAiJson(rawText);
  } catch (error) {
    throw new RetryableAiOutputError(
      error?.message ?? "AI did not return valid JSON."
    );
  }
}

function getAiRetryDelaySeconds(error, attemptIndex) {
  const retryInfoDelay = getRetryInfoDelaySeconds(error);

  if (retryInfoDelay) {
    return Math.max(
      retryInfoDelay + 4,
      Math.ceil(GEMINI_REQUEST_SPACING_MS / 1000)
    );
  }

  const fallbackDelay = GEMINI_RETRY_DELAY_SECONDS[attemptIndex - 1];

  if (fallbackDelay) {
    return fallbackDelay;
  }

  return GEMINI_RETRY_DELAY_SECONDS[GEMINI_RETRY_DELAY_SECONDS.length - 1];
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function runRetriableAiStep(step, stepId, handler) {
  for (let attemptIndex = 1; attemptIndex <= GEMINI_MAX_ATTEMPTS; attemptIndex += 1) {
    let lastError = null;

    for (let modelIndex = 0; modelIndex < GEMINI_MODELS.length; modelIndex += 1) {
      const model = GEMINI_MODELS[modelIndex];
      const safeModelName = model.replaceAll(".", "-");

      try {
        return await step.run(
          `${stepId}-attempt-${attemptIndex}-${safeModelName}`,
          async () => {
            // Hold the shared concurrency slot while pacing requests across functions.
            await wait(GEMINI_REQUEST_SPACING_MS);
            return handler(model);
          }
        );
      } catch (error) {
        if (!isRetryableAiError(error)) {
          throw error;
        }

        lastError = error;

        const hasFallbackModel = modelIndex < GEMINI_MODELS.length - 1;

        if (hasFallbackModel) {
          console.warn(
            `AI step ${stepId} could not use ${model}. Trying the fallback model.`,
            {
              code: getAiErrorCode(error),
              status: getAiErrorStatus(error),
            }
          );
        }
      }
    }

    const hasAttemptsLeft = attemptIndex < GEMINI_MAX_ATTEMPTS;

    if (!hasAttemptsLeft) {
      throw lastError ?? new Error(`AI step ${stepId} failed after retries.`);
    }

    const delaySeconds = getAiRetryDelaySeconds(lastError, attemptIndex);

    console.warn(
      `AI step ${stepId} failed on all models. Retrying in ${delaySeconds}s.`,
      {
        code: getAiErrorCode(lastError),
        status: getAiErrorStatus(lastError),
      }
    );

    await step.sleep(
      `${stepId}-retry-wait-${attemptIndex}`,
      `${delaySeconds}s`
    );
  }

  throw new Error(`AI step ${stepId} failed after retries.`);
}

const COURSE_OUTLINE_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      title: {
        type: "STRING",
      },
      chapter_order: {
        type: "INTEGER",
      },
    },
    required: ["title", "chapter_order"],
  },
};

const QUIZ_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      question: {
        type: "STRING",
      },
      optionA: {
        type: "STRING",
      },
      optionB: {
        type: "STRING",
      },
      optionC: {
        type: "STRING",
      },
      optionD: {
        type: "STRING",
      },
      correctOption: {
        type: "STRING",
      },
      explanation: {
        type: "STRING",
      },
      question_order: {
        type: "INTEGER",
      },
    },
    required: [
      "question",
      "optionA",
      "optionB",
      "optionC",
      "optionD",
      "correctOption",
      "explanation",
      "question_order",
    ],
  },
};

const FLASHCARD_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      front: {
        type: "STRING",
      },
      back: {
        type: "STRING",
      },
      flashcard_order: {
        type: "INTEGER",
      },
    },
    required: ["front", "back", "flashcard_order"],
  },
};

function buildCourseOutlineRows(parsedChapters) {
  if (!Array.isArray(parsedChapters)) {
    throw new RetryableAiOutputError(
      "Course outline response was not an array."
    );
  }

  if (parsedChapters.length === 0) {
    throw new RetryableAiOutputError(
      "Course outline response did not include chapters."
    );
  }

  return parsedChapters.map((chapter, index) => {
    return {
      title: getRequiredText(chapter.title, "Chapter title"),
      chapter_order: getOrder(chapter.chapter_order, index + 1),
    };
  });
}

function getCorrectOption(question) {
  let correctOption = question.correctOption;

  if (!correctOption) {
    correctOption = question.correct_option;
  }

  correctOption = String(correctOption).trim().toUpperCase();

  if (correctOption === "OPTION A") {
    correctOption = "A";
  }

  if (correctOption === "OPTIONA") {
    correctOption = "A";
  }

  if (correctOption === "OPTION B") {
    correctOption = "B";
  }

  if (correctOption === "OPTIONB") {
    correctOption = "B";
  }

  if (correctOption === "OPTION C") {
    correctOption = "C";
  }

  if (correctOption === "OPTIONC") {
    correctOption = "C";
  }

  if (correctOption === "OPTION D") {
    correctOption = "D";
  }

  if (correctOption === "OPTIOND") {
    correctOption = "D";
  }

  const validOptions = ["A", "B", "C", "D"];

  if (!validOptions.includes(correctOption)) {
    throw new RetryableAiOutputError(
      "Quiz question has an invalid correct option."
    );
  }

  return correctOption;
}

function buildQuizQuestionRows(parsedQuestions, quizId) {
  if (!Array.isArray(parsedQuestions)) {
    throw new RetryableAiOutputError("Quiz response was not an array.");
  }

  if (parsedQuestions.length === 0) {
    throw new RetryableAiOutputError(
      "Quiz response did not include questions."
    );
  }

  if (parsedQuestions.length !== 10) {
    throw new RetryableAiOutputError(
      "Quiz response must include exactly 10 questions."
    );
  }

  return parsedQuestions.map((question, index) => {
    let questionOrder = question.question_order;

    if (!questionOrder) {
      questionOrder = question.questionOrder;
    }

    return {
      quizId: quizId,
      question: getRequiredText(question.question, "Question"),
      optionA: getRequiredText(question.optionA, "Option A"),
      optionB: getRequiredText(question.optionB, "Option B"),
      optionC: getRequiredText(question.optionC, "Option C"),
      optionD: getRequiredText(question.optionD, "Option D"),
      correctOption: getCorrectOption(question),
      explanation: getRequiredText(question.explanation, "Explanation"),
      question_order: getOrder(questionOrder, index + 1),
    };
  });
}

function buildFlashcardRows(parsedFlashcards, courseId, userId) {
  if (!Array.isArray(parsedFlashcards)) {
    throw new RetryableAiOutputError(
      "Flashcard response was not an array."
    );
  }

  if (parsedFlashcards.length === 0) {
    throw new RetryableAiOutputError(
      "Flashcard response did not include flashcards."
    );
  }

  if (parsedFlashcards.length !== 20) {
    throw new RetryableAiOutputError(
      "Flashcard response must include exactly 20 flashcards."
    );
  }

  return parsedFlashcards.map((flashcard, index) => {
    let flashcardOrder = flashcard.flashcard_order;

    if (!flashcardOrder) {
      flashcardOrder = flashcard.flashcardOrder;
    }

    return {
      userId: userId,
      courseId: courseId,
      front: getRequiredText(flashcard.front, "Flashcard front"),
      back: getRequiredText(flashcard.back, "Flashcard back"),
      flashcard_order: getOrder(flashcardOrder, index + 1),
    };
  });
}

export const testCourseGeneration = inngest.createFunction(
  {
    id: "test-course-generation",
    retries: 0,
    concurrency: GEMINI_CONCURRENCY,
    triggers: {
      event: "course/generate.requested",
    },
  },
  async ({ event, step }) => {
    const courseId = event.data.courseId;
    const jobId = event.data.jobId;
    const userId = event.data.userId;
    const title = event.data.title;
    const description = event.data.description;

    try {
      await step.run("mark-course-generating", async () => {
        await db
          .update(coursesTable)
          .set({
            status: "generating",
          })
          .where(eq(coursesTable.id, courseId));
      });

      const courseOutline = await runRetriableAiStep(
        step,
        "generate-course-outline",
        async (model) => {
          const response = await gemini.models.generateContent({
            model: model,
            config: getJsonConfig(COURSE_OUTLINE_SCHEMA, 4096),
            contents: `
            You are SyllabroAI, an elite AI course architect and expert teacher.

            Create a course outline only.

            Course title:
            ${title}

            Course description:
            ${description}

            Return ONLY valid JSON.
            Do not include markdown fences.
            Do not include any explanation outside JSON.

            The JSON must be an array of chapter objects.
            Each object must have:
            - title
            - chapter_order

            Use 6 to 8 chapters.
            If the topic is broad, advanced, professional, or asks for depth, use 8 chapters.
            If the topic is narrow, use 6 chapters.

            Rules:
            - chapter_order must start at 1.
            - The course must flow from foundations to advanced application.
            - Titles must be clear, professional, and specific.
            - Avoid vague titles like "Introduction" by itself.
          `,
          });

          const parsedChapters = parseGeneratedJson(response.text);
          return buildCourseOutlineRows(parsedChapters);
        }
      );

      const chapters = [];

      for (const outlineChapter of courseOutline) {
        const generatedChapter = await runRetriableAiStep(
          step,
          `generate-chapter-${outlineChapter.chapter_order}`,
          async (model) => {
            const response = await gemini.models.generateContent({
              model: model,
              config: getTextConfig(10000),
              contents: `
                You are SyllabroAI, a patient expert teacher.

                Write one serious study chapter as plain text.
                Do not return JSON.
                Do not include markdown fences around the whole answer.
                Start directly with "1. Overview".

                Course title:
                ${title}

                Course description:
                ${description}

                Chapter ${outlineChapter.chapter_order}:
                ${outlineChapter.title}

                The chapter must include these sections in this exact order:

                1. Overview
                Explain what the chapter is about and why it matters.

                2. Learning Objectives
                List 4 to 6 clear objectives.

                3. Core Concepts
                Explain the main ideas deeply but simply.
                Use beginner-friendly language.
                Use analogies where useful.
                Include enough detail that a learner can study without immediately needing another source.

                4. Step-by-Step Explanation
                Break the topic into ordered steps.
                Explain how a learner should think through the concept.

                5. Practical Examples
                If the course involves programming, include realistic code examples.
                If the course involves mathematics, include formulas, worked examples, and explanations of each step.
                If the course involves science, include real-world applications and cause-effect reasoning.
                If the course involves business, include scenarios, frameworks, and decision examples.
                If the course involves language or writing, include examples, corrections, and practice prompts.

                6. Common Mistakes
                List common learner mistakes and explain how to avoid them.

                7. Real-World Application
                Explain where this chapter is used in real life or professional work.

                8. Practice Tasks
                Give 4 to 7 exercises.
                Start easy, then increase difficulty.

                9. Quick Self-Test
                Give 4 to 6 short questions the learner can answer to check understanding.

                10. Summary
                Summarize the chapter clearly.

                Quality rules:
                - Write like a patient expert teacher.
                - Make the content detailed and useful.
                - Do not write generic filler.
                - Do not mention that you are an AI.
                - Use original explanations.
                - If code is needed, format code clearly.
                - If math is needed, show the formula, substitution, and final answer.
                - Keep the chapter focused on this chapter title.
              `,
            });

            return {
              courseId: courseId,
              title: outlineChapter.title,
              content: getGeneratedText(response, "Chapter content"),
              chapter_order: outlineChapter.chapter_order,
            };
          }
        );

        chapters.push(generatedChapter);

        await step.run(
          `mark-course-progress-${outlineChapter.chapter_order}`,
          async () => {
            await markGenerationJobRunning(
              jobId,
              `Generated chapter ${chapters.length} of ${courseOutline.length}.`
            );
          }
        );
      }

      chapters.sort((firstChapter, secondChapter) => {
        return firstChapter.chapter_order - secondChapter.chapter_order;
      });

      await step.run("save-ai-chapters", async () => {
        await db
          .delete(chaptersTable)
          .where(eq(chaptersTable.courseId, courseId));

        await db.insert(chaptersTable).values(chapters);
      });

      await step.run("mark-course-completed", async () => {
        await db
          .update(coursesTable)
          .set({
            status: "completed",
          })
          .where(eq(coursesTable.id, courseId));
      });

      await step.run("mark-course-job-completed", async () => {
        await markGenerationJobCompleted(
          jobId,
          "Course generation completed."
        );
      });

      return {
        success: true,
        message: "AI course generation completed.",
      };
    } catch (error) {
      console.error("Course generation failed:", error);

      await step.run("mark-course-failed", async () => {
        await db
          .update(coursesTable)
          .set({
            status: "failed",
          })
          .where(
            and(
              eq(coursesTable.id, courseId),
              eq(coursesTable.userId, userId)
            )
          );
      });

      await step.run("mark-course-job-failed", async () => {
        await markGenerationJobFailed(jobId, "Course generation failed.");
      });

      return {
        success: false,
        message: "AI course generation failed.",
      };
    }
  }
);

export const generateQuiz = inngest.createFunction(
  {
    id: "generate-quiz",
    retries: 0,
    concurrency: GEMINI_CONCURRENCY,
    triggers: {
      event: "quiz/generate.requested",
    },
  },
  async ({ event, step }) => {
    const quizId = event.data.quizId;
    const jobId = event.data.jobId;
    const courseId = event.data.courseId;
    const userId = event.data.userId;
    const courseTitle = event.data.courseTitle;
    const chapters = event.data.chapters;

    try {
      const questionRows = await runRetriableAiStep(step, "generate-quiz-json", async (model) => {
        const chapterSourceText = getChapterSourceText(chapters);

        const response = await gemini.models.generateContent({
          model: model,
          config: getJsonConfig(QUIZ_SCHEMA, 8192),
          contents: `
            You are SyllabroAI, an expert teacher creating assessment material.

            Course title:
            ${courseTitle}

            Course chapters:
            ${chapterSourceText}

            Create exactly 10 multiple-choice quiz questions.

            Return ONLY valid JSON.
            Do not include markdown fences.
            Do not include explanations outside JSON.

            The JSON must be an array.
            Each item must have exactly:
            - question
            - optionA
            - optionB
            - optionC
            - optionD
            - correctOption
            - explanation
            - question_order

            Quality rules:
            - Test real understanding, not shallow memorization.
            - Include beginner, intermediate, and applied questions.
            - Make all wrong options plausible but clearly incorrect.
            - correctOption must be A, B, C, or D.
            - Explanations must teach why the answer is correct.

            JSON example:
            [
              {
                "question": "Clear question text?",
                "optionA": "First option",
                "optionB": "Second option",
                "optionC": "Third option",
                "optionD": "Fourth option",
                "correctOption": "A",
                "explanation": "Teaching explanation.",
                "question_order": 1
              }
            ]
          `,
        });

        const parsedQuestions = parseGeneratedJson(response.text);
        return buildQuizQuestionRows(parsedQuestions, quizId);
      });

      await step.run("save-quiz-questions", async () => {
        await db
          .delete(quizQuestionsTable)
          .where(eq(quizQuestionsTable.quizId, quizId));

        await db.insert(quizQuestionsTable).values(questionRows);
      });

      await step.run("mark-quiz-completed", async () => {
        await db
          .update(quizzesTable)
          .set({
            status: "completed",
          })
          .where(
            and(
              eq(quizzesTable.id, quizId),
              eq(quizzesTable.userId, userId)
            )
          );
      });

      await step.run("mark-quiz-job-completed", async () => {
        await markGenerationJobCompleted(jobId, "Quiz generation completed.");
      });

      return {
        success: true,
        message: "Quiz generation completed.",
      };
    } catch (error) {
      console.error("Quiz generation failed:", error);

      await step.run("mark-quiz-failed", async () => {
        await db
          .update(quizzesTable)
          .set({
            status: "failed",
          })
          .where(
            and(
              eq(quizzesTable.id, quizId),
              eq(quizzesTable.userId, userId)
            )
          );
      });

      await step.run("mark-quiz-job-failed", async () => {
        await markGenerationJobFailed(jobId, "Quiz generation failed.");
      });

      return {
        success: false,
        message: "Quiz generation failed.",
      };
    }
  }
);

export const generateFlashcards = inngest.createFunction(
  {
    id: "generate-flashcards",
    retries: 0,
    concurrency: GEMINI_CONCURRENCY,
    triggers: {
      event: "flashcards/generate.requested",
    },
  },
  async ({ event, step }) => {
    const jobId = event.data.jobId;
    const courseId = event.data.courseId;
    const userId = event.data.userId;
    const courseTitle = event.data.courseTitle;
    const chapters = event.data.chapters;

    try {
      const flashcardRows = await runRetriableAiStep(step, "generate-flashcard-json", async (model) => {
        const chapterSourceText = getChapterSourceText(chapters);

        const response = await gemini.models.generateContent({
          model: model,
          config: getJsonConfig(FLASHCARD_SCHEMA, 8192),
          contents: `
            You are SyllabroAI, an expert teacher creating active recall material.

            Course title:
            ${courseTitle}

            Course chapters:
            ${chapterSourceText}

            Create exactly 20 flashcards.

            Return ONLY valid JSON.
            Do not include markdown fences.
            Do not include explanations outside JSON.

            The JSON must be an array.
            Each item must have exactly:
            - front
            - back
            - flashcard_order

            Quality rules:
            - The front should ask a clear active recall question.
            - The back should explain the answer clearly.
            - Include definitions, code concepts, formulas, mistakes, comparisons, and practical knowledge where relevant.
            - Keep each card focused on one idea.

            JSON example:
            [
              {
                "front": "What question should the learner answer?",
                "back": "Clear teaching answer.",
                "flashcard_order": 1
              }
            ]
          `,
        });

        const parsedFlashcards = parseGeneratedJson(response.text);
        return buildFlashcardRows(parsedFlashcards, courseId, userId);
      });

      await step.run("replace-course-flashcards", async () => {
        await db
          .delete(flashcardsTable)
          .where(
            and(
              eq(flashcardsTable.courseId, courseId),
              eq(flashcardsTable.userId, userId)
            )
          );

        await db.insert(flashcardsTable).values(flashcardRows);
      });

      await step.run("mark-flashcards-job-completed", async () => {
        await markGenerationJobCompleted(
          jobId,
          "Flashcard generation completed."
        );
      });

      return {
        success: true,
        message: "Flashcard generation completed.",
      };
    } catch (error) {
      console.error("Flashcard generation failed:", error);

      await step.run("mark-flashcards-job-failed", async () => {
        await markGenerationJobFailed(
          jobId,
          "Flashcard generation failed."
        );
      });

      return {
        success: false,
        message: "Flashcard generation failed.",
      };
    }
  }
);

export const generateExam = inngest.createFunction(
  {
    id: "generate-exam",
    retries: 0,
    concurrency: GEMINI_CONCURRENCY,
    triggers: {
      event: "exam/generate.requested",
    },
  },
  async ({ event, step }) => {
    const examId = event.data.examId;
    const jobId = event.data.jobId;
    const userId = event.data.userId;
    const courseTitle = event.data.courseTitle;
    const chapters = event.data.chapters;

    try {
      const examContent = await runRetriableAiStep(step, "generate-exam-content", async (model) => {
        const chapterSourceText = getChapterSourceText(chapters);

        const response = await gemini.models.generateContent({
          model: model,
          config: getTextConfig(10000),
          contents: `
            You are SyllabroAI, an expert teacher creating serious assessment material.

            Course title:
            ${courseTitle}

            Course chapters:
            ${chapterSourceText}

            Create a serious structured exam for this course.
            The exam should feel useful for real revision, not like a short worksheet.

            Return the exam paper as plain text.
            Do not return JSON.
            Do not include the marking guide yet.

            The exam content must include:
            - Instructions
            - Suggested time
            - Total marks
            - Section A: Multiple Choice with 10 questions
            - Section B: Short Answer with 6 questions
            - Section C: Practical/Application Questions with 4 questions
            - Section D: Advanced Challenge with 2 deeper questions

            Quality rules:
            - Make the exam serious and structured.
            - Test understanding, application, and reasoning.
            - Use the course chapters as the source of truth.
            - Include beginner, intermediate, and advanced coverage.
            - For programming exams, include code-reading and code-writing questions.
            - For math exams, include worked marking steps and final answers.
            - For business or theory exams, include scenario-based questions.
          `,
        });

        return getGeneratedText(response, "Exam content");
      });

      const markingGuide = await runRetriableAiStep(step, "generate-marking-guide", async (model) => {
        const response = await gemini.models.generateContent({
          model: model,
          config: getTextConfig(10000),
          contents: `
            You are SyllabroAI, an expert teacher creating a marking guide.

            Course title:
            ${courseTitle}

            Exam paper:
            ${examContent}

            Create the marking guide as plain text.
            Do not return JSON.

            The marking guide must include:
            - correct answers
            - expected points
            - explanations
            - grading notes
            - common mistakes to watch for

            Make it useful for self-study.
            For math questions, show worked marking steps and final answers.
            For programming questions, explain expected code behavior and common mistakes.
          `,
        });

        return getGeneratedText(response, "Marking guide");
      });

      await step.run("save-exam", async () => {
        await db
          .update(examsTable)
          .set({
            content: examContent,
            markingGuide: markingGuide,
            status: "completed",
          })
          .where(
            and(
              eq(examsTable.id, examId),
              eq(examsTable.userId, userId)
            )
          );
      });

      await step.run("mark-exam-job-completed", async () => {
        await markGenerationJobCompleted(jobId, "Exam generation completed.");
      });

      return {
        success: true,
        message: "Exam generation completed.",
      };
    } catch (error) {
      console.error("Exam generation failed:", error);

      await step.run("mark-exam-failed", async () => {
        await db
          .update(examsTable)
          .set({
            status: "failed",
          })
          .where(
            and(
              eq(examsTable.id, examId),
              eq(examsTable.userId, userId)
            )
          );
      });

      await step.run("mark-exam-job-failed", async () => {
        await markGenerationJobFailed(jobId, "Exam generation failed.");
      });

      return {
        success: false,
        message: "Exam generation failed.",
      };
    }
  }
);

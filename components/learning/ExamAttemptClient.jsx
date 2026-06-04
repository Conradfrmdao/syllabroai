"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, NotebookPen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ").trim();
}

function cleanMarkdownText(value) {
  return value
    .replace(/^#{1,6}\s*/, "")
    .replace(/^\*\*(.+)\*\*$/, "$1")
    .replace(/^\*(.+)\*$/, "$1")
    .replace(/^-{3,}$/, "")
    .trim();
}

function renderInlineText(text) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      return (
        <code
          key={index}
          className="rounded-md border border-white/10 bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.88em] text-white"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={index} className="text-white/86">
          {part.slice(1, -1)}
        </em>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function TextLines({ text }) {
  const lines = normalizeText(text)
    .split("\n")
    .map((line) => cleanMarkdownText(line))
    .filter(Boolean);

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      {lines.map((line, index) => (
        <p key={index} className="break-words text-sm leading-6 text-white/72 sm:text-[0.98rem] sm:leading-8">
          {renderInlineText(line)}
        </p>
      ))}
    </div>
  );
}

function parseExamContent(content) {
  const lines = normalizeText(content).split("\n");
  const overviewLines = [];
  const questions = [];
  let currentSection = "";
  let currentQuestion = null;
  let hasReachedSection = false;

  function saveQuestion() {
    if (!currentQuestion) {
      return;
    }

    currentQuestion.text = currentQuestion.textLines.join("\n").trim();
    questions.push(currentQuestion);
    currentQuestion = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const cleanLine = cleanMarkdownText(line);

    if (!cleanLine) {
      continue;
    }

    const sectionMatch = cleanLine.match(/^Section\s+([A-Z])[:.)-]?\s*(.+)$/i);

    if (sectionMatch) {
      saveQuestion();
      hasReachedSection = true;
      currentSection = `Section ${sectionMatch[1].toUpperCase()}: ${sectionMatch[2].trim()}`;
      continue;
    }

    const questionMatch = cleanLine.match(/^(\d{1,2})[.)]\s+(.+)$/);

    if (hasReachedSection && questionMatch) {
      saveQuestion();
      currentQuestion = {
        number: questionMatch[1],
        section: currentSection || "Exam Questions",
        textLines: [questionMatch[2]],
        text: "",
        options: [],
      };
      continue;
    }

    const optionMatch = cleanLine.match(/^([a-dA-D])[.)]\s+(.+)$/);

    if (currentQuestion && optionMatch) {
      currentQuestion.options.push({
        label: optionMatch[1].toUpperCase(),
        text: optionMatch[2],
      });
      continue;
    }

    if (currentQuestion) {
      currentQuestion.textLines.push(cleanLine);
      continue;
    }

    overviewLines.push(cleanLine);
  }

  saveQuestion();

  return {
    overview: overviewLines.join("\n"),
    questions,
  };
}

function getGuideSnippet(markingGuide, question) {
  const cleanGuide = normalizeText(markingGuide);

  if (!cleanGuide || !question) {
    return "";
  }

  const escapedNumber = question.number.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const answerRegex = new RegExp(
    `(?:^|\\n)\\s*(?:Question\\s*)?${escapedNumber}[.)]\\s+([\\s\\S]*?)(?=\\n\\s*(?:Question\\s*)?\\d{1,2}[.)]\\s+|\\n\\s*Section\\s+[A-Z]|$)`,
    "i"
  );
  const match = cleanGuide.match(answerRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  return cleanGuide;
}

export default function ExamAttemptClient({ exam }) {
  const parsedExam = useMemo(() => parseExamContent(exam.content), [exam.content]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMarkingGuide, setShowMarkingGuide] = useState(false);
  const [answerNotes, setAnswerNotes] = useState("");

  const totalQuestions = parsedExam.questions.length;
  const currentQuestion = parsedExam.questions[currentIndex];
  const guideSnippet = getGuideSnippet(exam.markingGuide, currentQuestion);

  function handlePrevious() {
    setCurrentIndex((index) => Math.max(index - 1, 0));
    setShowMarkingGuide(false);
  }

  function handleNext() {
    setCurrentIndex((index) => Math.min(index + 1, totalQuestions - 1));
    setShowMarkingGuide(false);
  }

  function handleNotesChange(event) {
    setAnswerNotes(event.target.value);
  }

  if (totalQuestions === 0) {
    return (
      <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
        <CardHeader className="border-b border-white/8 px-4 pb-4 sm:px-5 sm:pb-5">
          <CardTitle className="text-xl sm:text-2xl">Exam Paper</CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <TextLines text={exam.content} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0 space-y-2">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/38 sm:text-xs sm:tracking-[0.2em]">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
            <h2 className="break-words text-xl font-semibold text-white sm:text-2xl">
              Work through one question, then reveal the answer.
            </h2>
            <TextLines text={parsedExam.overview} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
          <CardHeader className="border-b border-white/8 px-4 pb-4 sm:px-5 sm:pb-5">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/38 sm:text-xs sm:tracking-[0.2em]">
              {currentQuestion.section}
            </p>
            <CardTitle className="text-xl sm:text-2xl">Question {currentQuestion.number}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 p-4 sm:p-6">
            <TextLines text={currentQuestion.text} />

            {currentQuestion.options.length > 0 && (
              <div className="space-y-2.5">
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.label}
                    className="flex min-w-0 gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-3 text-sm leading-6 text-white/72"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold text-white">
                      {option.label}
                    </span>
                    <span className="min-w-0 break-words">{renderInlineText(option.text)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" className="rounded-full" onClick={handlePrevious} disabled={currentIndex === 0}>
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                type="button"
                className="rounded-full"
                onClick={() => setShowMarkingGuide((current) => !current)}
              >
                {showMarkingGuide ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showMarkingGuide ? "Hide Answer" : "Show Answer"}
              </Button>

              <Button type="button" variant="outline" className="rounded-full" onClick={handleNext} disabled={currentIndex >= totalQuestions - 1}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
          <CardHeader className="border-b border-white/8 px-4 pb-4 sm:px-5 sm:pb-5">
            <div className="flex items-center gap-3">
              <NotebookPen className="h-5 w-5 text-white/62" />
              <CardTitle className="text-xl sm:text-2xl">My Answer Notes</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-4 sm:p-6">
            <textarea
              value={answerNotes}
              onChange={handleNotesChange}
              placeholder="Write your answer for this question. These notes stay local and are not saved yet."
              className="min-h-[13rem] w-full resize-none rounded-[1.25rem] border border-white/10 bg-black/30 p-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-white/24 focus:bg-black/40 sm:min-h-[18rem] sm:rounded-[1.5rem] sm:p-4 sm:leading-7"
            />

            {showMarkingGuide && (
              <div className="max-h-[22rem] overflow-y-auto rounded-[1.25rem] border border-emerald-300/18 bg-emerald-300/[0.07] p-4">
                <p className="mb-3 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-emerald-100/58 sm:text-xs">
                  Answer / Marking Guide
                </p>
                <TextLines text={guideSnippet} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

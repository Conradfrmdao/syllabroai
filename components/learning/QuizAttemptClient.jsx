"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getOptions(question) {
  return [
    {
      letter: "A",
      text: question.optionA,
    },
    {
      letter: "B",
      text: question.optionB,
    },
    {
      letter: "C",
      text: question.optionC,
    },
    {
      letter: "D",
      text: question.optionD,
    },
  ];
}

function getQuestionKey(question) {
  return String(question.id);
}

function getSelectedAnswer(selectedAnswers, question) {
  const questionKey = getQuestionKey(question);
  const selectedAnswer = selectedAnswers[questionKey];

  if (!selectedAnswer) {
    return "";
  }

  return selectedAnswer;
}

function getScore(questions, selectedAnswers) {
  let score = 0;

  for (const question of questions) {
    const selectedAnswer = getSelectedAnswer(selectedAnswers, question);

    if (selectedAnswer === question.correctOption) {
      score += 1;
    }
  }

  return score;
}

function getAnsweredCount(questions, selectedAnswers) {
  let answeredCount = 0;

  for (const question of questions) {
    const selectedAnswer = getSelectedAnswer(selectedAnswers, question);

    if (selectedAnswer) {
      answeredCount += 1;
    }
  }

  return answeredCount;
}

function getOptionClassName(question, option, selectedAnswer) {
  let className =
    "w-full rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-left text-sm leading-6 text-white/68 transition hover:border-white/18 hover:bg-white/[0.07] hover:text-white";

  if (
    selectedAnswer === option.letter &&
    option.letter === question.correctOption
  ) {
    className =
      "w-full rounded-2xl border border-emerald-400/35 bg-emerald-400/12 p-4 text-left text-sm leading-6 text-emerald-50 transition";
  }

  if (
    selectedAnswer === option.letter &&
    option.letter !== question.correctOption
  ) {
    className =
      "w-full rounded-2xl border border-rose-400/35 bg-rose-400/12 p-4 text-left text-sm leading-6 text-rose-50 transition";
  }

  return className;
}

function QuestionFeedback({ question, selectedAnswer }) {
  if (!selectedAnswer) {
    return null;
  }

  let isCorrect = false;

  if (selectedAnswer === question.correctOption) {
    isCorrect = true;
  }

  let resultIcon = <XCircle className="h-4 w-4 text-rose-200" />;
  let resultText = "Not quite. Try another answer.";
  let answerLine = "That choice is not the best answer.";
  let resultClassName =
    "rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4";

  if (isCorrect) {
    resultIcon = <CheckCircle2 className="h-4 w-4 text-emerald-200" />;
    resultText = "Correct. Nice work.";
    answerLine = `Correct answer: ${question.correctOption}`;
    resultClassName =
      "rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4";
  }

  return (
    <div className={resultClassName}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        {resultIcon}
        {resultText}
      </div>

      <div className="space-y-2 text-sm leading-7 text-white/68">
        <p>Your answer: {selectedAnswer}</p>
        <p>{answerLine}</p>
        <p>{question.explanation}</p>
      </div>
    </div>
  );
}

export default function QuizAttemptClient({ quiz, questions }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  if (!questions || questions.length === 0) {
    return (
      <Card className="glass-panel-strong rounded-[2rem]">
        <CardContent className="p-6 sm:p-8">
          <p className="text-sm leading-7 text-white/62">
            This quiz has no questions yet. Refresh in a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalQuestions = questions.length;
  const answeredCount = getAnsweredCount(questions, selectedAnswers);
  const score = getScore(questions, selectedAnswers);

  function handleSelect(question, letter) {
    const questionKey = getQuestionKey(question);

    setSelectedAnswers((currentAnswers) => {
      return {
        ...currentAnswers,
        [questionKey]: letter,
      };
    });
  }

  function handleRetake() {
    setSelectedAnswers({});
  }

  let summaryContent = (
    <p className="text-sm leading-7 text-white/58">
      Choose an answer and get feedback immediately. If you miss it, keep
      trying until you find the correct choice.
    </p>
  );

  if (answeredCount > 0) {
    summaryContent = (
      <div className="space-y-2">
        <p className="text-3xl font-semibold tracking-tight text-white">
          {score} correct
        </p>
        <p className="text-sm leading-7 text-white/58">
          {answeredCount} of {totalQuestions} questions attempted in this
          practice session.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="glass-panel-strong rounded-[2rem]">
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit">
              Attempt mode
            </Badge>
            <h2 className="text-2xl font-semibold text-white">
              {quiz.title}
            </h2>
            {summaryContent}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white/62">
            Answered {answeredCount} of {totalQuestions}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        {questions.map((question, index) => {
          const options = getOptions(question);
          const selectedAnswer = getSelectedAnswer(selectedAnswers, question);
          const resultContent = (
            <QuestionFeedback
              question={question}
              selectedAnswer={selectedAnswer}
            />
          );

          return (
            <Card key={question.id} className="glass-panel-strong rounded-[2rem]">
              <CardHeader className="border-b border-white/8 pb-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white text-sm font-semibold text-black">
                    {index + 1}
                  </span>

                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/38">
                      Question {question.question_order}
                    </p>
                    <CardTitle className="text-xl leading-snug">
                      {question.question}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 p-6">
                <div className="grid gap-3">
                  {options.map((option) => {
                    const optionClassName = getOptionClassName(
                      question,
                      option,
                      selectedAnswer
                    );

                    return (
                      <button
                        key={option.letter}
                        type="button"
                        className={optionClassName}
                        onClick={() => handleSelect(question, option.letter)}
                        aria-pressed={selectedAnswer === option.letter}
                      >
                        <span className="mr-2 font-semibold">
                          {option.letter}.
                        </span>
                        {option.text}
                      </button>
                    );
                  })}
                </div>

                {resultContent}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={handleRetake}
        >
          <RotateCcw className="h-4 w-4" />
          Retake Quiz
        </Button>
      </div>
    </div>
  );
}

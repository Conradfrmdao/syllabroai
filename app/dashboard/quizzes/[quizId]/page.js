export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft, CheckCircle2, FileQuestion } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quizQuestionsTable, quizzesTable } from "@/db/schema";
import { db } from "@/lib/db";
import { safelyMarkStaleGenerationJobs } from "@/lib/generation-jobs";

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

function StatusMessage({ status }) {
  if (status === "generating") {
    return (
      <Card className="glass-panel-strong rounded-[2rem]">
        <CardContent className="p-6 sm:p-8">
          <p className="text-sm leading-7 text-white/62">
            Quiz is still generating. Refresh in a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === "failed") {
    return (
      <Card className="glass-panel-strong rounded-[2rem]">
        <CardContent className="p-6 sm:p-8">
          <p className="text-sm leading-7 text-rose-100">
            Quiz generation failed. Please go back to the course and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export default async function QuizDetailsPage({ params }) {
  const resolvedParams = await params;
  const quizId = Number(resolvedParams.quizId);

  if (Number.isNaN(quizId)) {
    return <div>Invalid quiz ID</div>;
  }

  const { userId } = await auth();

  if (!userId) {
    return <div>You must be signed in to view this quiz.</div>;
  }

  await safelyMarkStaleGenerationJobs();

  let quiz = null;
  let questions = [];
  let errorMessage = "";

  try {
    const quizResult = await db
      .select()
      .from(quizzesTable)
      .where(
        and(
          eq(quizzesTable.id, quizId),
          eq(quizzesTable.userId, userId)
        )
      )
      .limit(1);

    quiz = quizResult[0];

    if (quiz) {
      questions = await db
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.quizId, quiz.id))
        .orderBy(asc(quizQuestionsTable.question_order));
    }
  } catch (error) {
    console.warn("Failed to fetch quiz:", error?.message ?? error);
    errorMessage =
      "Database connection is temporarily unavailable. Please refresh in a moment.";
  }

  if (errorMessage) {
    return (
      <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
        {errorMessage}
      </p>
    );
  }

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  const statusContent = <StatusMessage status={quiz.status} />;

  let questionContent = null;

  if (quiz.status === "completed" && questions.length === 0) {
    questionContent = (
      <Card className="glass-panel-strong rounded-[2rem]">
        <CardContent className="p-6 sm:p-8">
          <p className="text-sm leading-7 text-white/62">
            This quiz has no questions yet. Refresh in a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (quiz.status === "completed" && questions.length > 0) {
    questionContent = (
      <div className="space-y-5">
        {questions.map((question) => {
          const options = getOptions(question);

          return (
            <Card key={question.id} className="glass-panel-strong rounded-[2rem]">
              <CardHeader className="border-b border-white/8 pb-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white text-sm font-semibold text-black">
                    {question.question_order}
                  </span>

                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/38">
                      Study Question
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
                    let optionClass =
                      "rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm leading-6 text-white/66";

                    if (option.letter === question.correctOption) {
                      optionClass =
                        "rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-50";
                    }

                    return (
                      <div key={option.letter} className={optionClass}>
                        <span className="mr-2 font-semibold">
                          {option.letter}.
                        </span>
                        {option.text}
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                    <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                    Correct answer: {question.correctOption}
                  </div>
                  <p className="text-sm leading-7 text-white/62">
                    {question.explanation}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-3">
        <Badge variant="secondary" className="w-fit">
          <FileQuestion className="h-3.5 w-3.5" />
          Study-mode quiz
        </Badge>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {quiz.title}
          </h1>
          <p className="text-sm text-white/52">Status: {quiz.status}</p>
        </div>
      </div>

      {statusContent}
      {questionContent}

      <Button asChild variant="ghost" className="rounded-full">
        <Link href="/dashboard/quizzes">
          <ArrowLeft className="h-4 w-4" />
          Back to Quizzes
        </Link>
      </Button>
    </div>
  );
}

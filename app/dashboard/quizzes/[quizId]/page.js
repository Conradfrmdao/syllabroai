export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft, FileQuestion } from "lucide-react";

import QuizAttemptClient from "@/components/learning/QuizAttemptClient";
import AutoRefreshWhenGenerating from "@/components/realtime/AutoRefreshWhenGenerating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { quizQuestionsTable, quizzesTable } from "@/db/schema";
import { db } from "@/lib/db";
import { safelyMarkStaleGenerationJobs } from "@/lib/generation-jobs";

function StatusMessage({ status }) {
  if (status === "generating") {
    return (
      <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
        <CardContent className="p-4 sm:p-8">
          <p className="text-sm leading-6 text-white/62 sm:leading-7">
            Quiz is still generating. Refresh in a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === "failed") {
    return (
      <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
        <CardContent className="p-4 sm:p-8">
          <p className="text-sm leading-6 text-rose-100 sm:leading-7">
            Quiz generation failed. Please go back to the course and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
}

function buildQuizPayload(quiz) {
  return {
    id: quiz.id,
    title: quiz.title,
    status: quiz.status,
  };
}

function buildQuestionPayload(question) {
  return {
    id: question.id,
    question: question.question,
    optionA: question.optionA,
    optionB: question.optionB,
    optionC: question.optionC,
    optionD: question.optionD,
    correctOption: question.correctOption,
    explanation: question.explanation,
    question_order: question.question_order,
  };
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
      <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
        <CardContent className="p-4 sm:p-8">
          <p className="text-sm leading-6 text-white/62 sm:leading-7">
            This quiz has no questions yet. Refresh in a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (quiz.status === "completed" && questions.length > 0) {
    const questionPayload = questions.map((question) => {
      return buildQuestionPayload(question);
    });

    questionContent = (
      <QuizAttemptClient
        quiz={buildQuizPayload(quiz)}
        questions={questionPayload}
      />
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl space-y-4 sm:space-y-6">
      <div className="space-y-3">
        <Badge variant="secondary" className="w-fit">
          <FileQuestion className="h-3.5 w-3.5" />
          Study-mode quiz
        </Badge>

        <div className="space-y-2">
          <h1 className="break-words text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            {quiz.title}
          </h1>
          <p className="text-sm text-white/52">Status: {quiz.status}</p>
        </div>
      </div>

      {statusContent}
      {questionContent}
      <AutoRefreshWhenGenerating enabled={quiz.status === "generating"} />

      <Button asChild variant="ghost" className="rounded-full">
        <Link href="/dashboard/quizzes">
          <ArrowLeft className="h-4 w-4" />
          Back to Quizzes
        </Link>
      </Button>
    </div>
  );
}

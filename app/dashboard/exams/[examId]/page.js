export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, GraduationCap } from "lucide-react";

import ExamAttemptClient from "@/components/learning/ExamAttemptClient";
import AutoRefreshWhenGenerating from "@/components/realtime/AutoRefreshWhenGenerating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { examsTable, generationJobsTable } from "@/db/schema";
import { db } from "@/lib/db";
import {
  markGenerationJobCompleted,
  markGenerationJobFailed,
  safelyMarkStaleGenerationJobs,
} from "@/lib/generation-jobs";

const EXAM_PLACEHOLDER_CONTENT = "Exam is generating.";
const EXAM_PLACEHOLDER_GUIDE = "Marking guide is generating.";
const EXAM_STALE_MINUTES = 10;

function StatusContent({ status, courseId }) {
  if (status === "generating") {
    return (
      <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
        <CardContent className="p-4 sm:p-8">
          <p className="text-sm leading-6 text-white/62 sm:leading-7">
            Exam is still generating. Refresh in a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === "failed") {
    return (
      <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
        <CardContent className="space-y-4 p-4 sm:space-y-5 sm:p-8">
          <p className="text-sm leading-6 text-rose-100 sm:leading-7">
            Exam generation failed or took too long. Please go back to the
            course and try again.
          </p>

          <Button asChild>
            <Link href={`/dashboard/courses/${courseId}`}>
              Generate Exam Again
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}

function buildExamPayload(exam) {
  return {
    id: exam.id,
    title: exam.title,
    content: exam.content,
    markingGuide: exam.markingGuide,
    status: exam.status,
  };
}

function hasGeneratedExamContent(exam) {
  if (!exam.content || !exam.markingGuide) {
    return false;
  }

  if (exam.content === EXAM_PLACEHOLDER_CONTENT) {
    return false;
  }

  if (exam.markingGuide === EXAM_PLACEHOLDER_GUIDE) {
    return false;
  }

  return true;
}

function isStalePlaceholderExam(exam) {
  if (exam.status !== "generating") {
    return false;
  }

  if (hasGeneratedExamContent(exam)) {
    return false;
  }

  if (!exam.createdAt) {
    return false;
  }

  const createdAt = new Date(exam.createdAt);
  const staleAt = new Date(createdAt.getTime() + EXAM_STALE_MINUTES * 60 * 1000);
  const now = new Date();

  if (now <= staleAt) {
    return false;
  }

  return true;
}

export default async function ExamDetailsPage({ params }) {
  const resolvedParams = await params;
  const examId = Number(resolvedParams.examId);

  if (Number.isNaN(examId)) {
    return <div>Invalid exam ID</div>;
  }

  const { userId } = await auth();

  if (!userId) {
    return <div>You must be signed in to view this exam.</div>;
  }

  await safelyMarkStaleGenerationJobs();

  let exam = null;
  let errorMessage = "";

  try {
    const examResult = await db
      .select()
      .from(examsTable)
      .where(
        and(
          eq(examsTable.id, examId),
          eq(examsTable.userId, userId)
        )
      )
      .limit(1);

    exam = examResult[0];

    if (exam && hasGeneratedExamContent(exam) && exam.status !== "completed") {
      await db
        .update(examsTable)
        .set({
          status: "completed",
        })
        .where(
          and(
            eq(examsTable.id, exam.id),
            eq(examsTable.userId, userId)
          )
        );

      const activeJobs = await db
        .select()
        .from(generationJobsTable)
        .where(
          and(
            eq(generationJobsTable.userId, userId),
            eq(generationJobsTable.jobType, "exam"),
            eq(generationJobsTable.targetId, exam.id),
            eq(generationJobsTable.status, "generating")
          )
        );

      for (const job of activeJobs) {
        await markGenerationJobCompleted(job.id, "Exam generation completed.");
      }

      exam.status = "completed";
    }

    if (exam && isStalePlaceholderExam(exam)) {
      await db
        .update(examsTable)
        .set({
          status: "failed",
        })
        .where(
          and(
            eq(examsTable.id, exam.id),
            eq(examsTable.userId, userId)
          )
        );

      const activeJobs = await db
        .select()
        .from(generationJobsTable)
        .where(
          and(
            eq(generationJobsTable.userId, userId),
            eq(generationJobsTable.jobType, "exam"),
            eq(generationJobsTable.targetId, exam.id),
            eq(generationJobsTable.status, "generating")
          )
        );

      for (const job of activeJobs) {
        await markGenerationJobFailed(
          job.id,
          "Exam generation timed out. Please try again."
        );
      }

      exam.status = "failed";
    }
  } catch (error) {
    console.warn("Failed to fetch exam:", error?.message ?? error);
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

  if (!exam) {
    return <div>Exam not found</div>;
  }

  const statusContent = (
    <StatusContent status={exam.status} courseId={exam.courseId} />
  );

  let examContent = null;

  if (exam.status === "completed") {
    examContent = <ExamAttemptClient exam={buildExamPayload(exam)} />;
  }

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      <div className="space-y-3">
        <Badge variant="secondary" className="w-fit">
          <GraduationCap className="h-3.5 w-3.5" />
          Structured exam
        </Badge>

        <div className="space-y-2">
          <h1 className="break-words text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            {exam.title}
          </h1>
          <p className="text-sm text-white/52">Status: {exam.status}</p>
        </div>
      </div>

      {statusContent}
      {examContent}
      <AutoRefreshWhenGenerating enabled={exam.status === "generating"} />

      <Button asChild variant="ghost" className="rounded-full">
        <Link href="/dashboard/exams">
          <ArrowLeft className="h-4 w-4" />
          Back to Exams
        </Link>
      </Button>
    </div>
  );
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { ArrowRight, GraduationCap, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AutoRefreshWhenGenerating from "@/components/realtime/AutoRefreshWhenGenerating";
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

function formatDate(date) {
  if (!date) {
    return "Unknown date";
  }

  return new Date(date).toLocaleDateString();
}

function StatusBadge({ status }) {
  let className =
    "w-fit rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/62";

  if (status === "completed") {
    className =
      "w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100";
  }

  if (status === "failed") {
    className =
      "w-fit rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-medium text-rose-100";
  }

  return <span className={className}>{status}</span>;
}

export default async function ExamsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>You must be signed in to view exams.</div>;
  }

  await safelyMarkStaleGenerationJobs();

  let exams = [];
  let errorMessage = "";

  try {
    exams = await db
      .select()
      .from(examsTable)
      .where(eq(examsTable.userId, userId))
      .orderBy(desc(examsTable.createdAt));

    for (const exam of exams) {
      if (hasGeneratedExamContent(exam) && exam.status !== "completed") {
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

      if (isStalePlaceholderExam(exam)) {
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
    }
  } catch (error) {
    console.warn("Failed to fetch exams:", error?.message ?? error);
    errorMessage =
      "Database connection is temporarily unavailable. Please refresh in a moment.";
  }

  let content;

  if (errorMessage) {
    content = (
      <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
        {errorMessage}
      </p>
    );
  }

  if (!errorMessage && exams.length === 0) {
    content = (
      <Card className="glass-panel-strong rounded-[2rem]">
        <CardContent className="p-6 sm:p-8">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-white">
                  No exams generated yet.
                </p>
                <p className="max-w-xl text-sm leading-7 text-white/56">
                  Open a saved course and generate a structured exam when you
                  are ready to test yourself.
                </p>
              </div>

              <Button asChild size="lg">
                <Link href="/dashboard/courses?generate=exam">
                  Choose Course
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!errorMessage && exams.length > 0) {
    content = (
      <div className="grid gap-4 lg:grid-cols-2">
        {exams.map((exam) => (
          <Card key={exam.id} className="glass-panel-strong rounded-[2rem]">
            <CardHeader className="space-y-3 border-b border-white/8 pb-5">
              <StatusBadge status={exam.status} />
              <CardTitle className="text-2xl">{exam.title}</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-white/52">
                Created {formatDate(exam.createdAt)}
              </p>

              <Button asChild variant="outline" className="rounded-full">
                <Link href={`/dashboard/exams/${exam.id}`}>Open Exam</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  let hasGeneratingExam = false;

  for (const exam of exams) {
    if (exam.status === "generating") {
      hasGeneratingExam = true;
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit">
            <GraduationCap className="h-3.5 w-3.5" />
            Exams
          </Badge>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Exams
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
              Generate structured exams from full course content when you are
              ready to test yourself.
            </p>
          </div>
        </div>

        <Button asChild>
          <Link href="/dashboard/courses?generate=exam">
            <Plus className="h-4 w-4" />
            Create Exam
          </Link>
        </Button>
      </div>

      {content}
      <AutoRefreshWhenGenerating enabled={hasGeneratingExam} />
    </div>
  );
}

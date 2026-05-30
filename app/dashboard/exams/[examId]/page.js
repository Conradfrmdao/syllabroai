export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { examsTable } from "@/db/schema";
import { db } from "@/lib/db";
import { safelyMarkStaleGenerationJobs } from "@/lib/generation-jobs";

function StatusContent({ status }) {
  if (status === "generating") {
    return (
      <Card className="glass-panel-strong rounded-[2rem]">
        <CardContent className="p-6 sm:p-8">
          <p className="text-sm leading-7 text-white/62">
            Exam is still generating. Refresh in a moment.
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
            Exam generation failed. Please go back to the course and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
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

  const statusContent = <StatusContent status={exam.status} />;

  let examContent = null;

  if (exam.status === "completed") {
    examContent = (
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="glass-panel-strong rounded-[2rem]">
          <CardHeader className="border-b border-white/8 pb-5">
            <CardTitle className="text-2xl">Exam Paper</CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="whitespace-pre-wrap text-sm leading-8 text-white/72">
              {exam.content}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel-strong rounded-[2rem]">
          <CardHeader className="border-b border-white/8 pb-5">
            <CardTitle className="text-2xl">Marking Guide</CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="whitespace-pre-wrap text-sm leading-8 text-white/72">
              {exam.markingGuide}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-3">
        <Badge variant="secondary" className="w-fit">
          <GraduationCap className="h-3.5 w-3.5" />
          Structured exam
        </Badge>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {exam.title}
          </h1>
          <p className="text-sm text-white/52">Status: {exam.status}</p>
        </div>
      </div>

      {statusContent}
      {examContent}

      <Button asChild variant="ghost" className="rounded-full">
        <Link href="/dashboard/exams">
          <ArrowLeft className="h-4 w-4" />
          Back to Exams
        </Link>
      </Button>
    </div>
  );
}

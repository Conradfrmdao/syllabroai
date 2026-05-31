export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft, BrainCircuit } from "lucide-react";

import FlashcardStudyClient from "@/components/learning/FlashcardStudyClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { coursesTable, flashcardsTable, generationJobsTable } from "@/db/schema";
import { db } from "@/lib/db";
import {
  markGenerationJobCompleted,
  safelyMarkStaleGenerationJobs,
} from "@/lib/generation-jobs";
import AutoRefreshWhenGenerating from "@/components/realtime/AutoRefreshWhenGenerating";

export default async function FlashcardStudyPage({ params }) {
  const resolvedParams = await params;
  const courseId = Number(resolvedParams.courseId);

  if (Number.isNaN(courseId)) {
    return <div>Invalid course ID</div>;
  }

  const { userId } = await auth();

  if (!userId) {
    return <div>You must be signed in to view flashcards.</div>;
  }

  await safelyMarkStaleGenerationJobs();

  let course = null;
  let flashcards = [];
  let activeJob = null;
  let errorMessage = "";

  try {
    const courseResult = await db
      .select()
      .from(coursesTable)
      .where(
        and(
          eq(coursesTable.id, courseId),
          eq(coursesTable.userId, userId)
        )
      )
      .limit(1);

    course = courseResult[0];

    if (course) {
      const activeJobs = await db
        .select()
        .from(generationJobsTable)
        .where(
          and(
            eq(generationJobsTable.courseId, courseId),
            eq(generationJobsTable.userId, userId),
            eq(generationJobsTable.jobType, "flashcards"),
            eq(generationJobsTable.status, "generating")
          )
        )
        .limit(1);

      activeJob = activeJobs[0];

      flashcards = await db
        .select()
        .from(flashcardsTable)
        .where(
          and(
            eq(flashcardsTable.courseId, courseId),
            eq(flashcardsTable.userId, userId)
          )
        )
        .orderBy(asc(flashcardsTable.flashcard_order));

      if (activeJob && flashcards.length > 0) {
        await markGenerationJobCompleted(
          activeJob.id,
          "Flashcards are ready."
        );
        activeJob = null;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch flashcards:", error?.message ?? error);
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

  if (!course) {
    return <div>Course not found</div>;
  }

  let content;

  if (activeJob) {
    content = (
      <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
        <CardContent className="p-4 sm:p-8">
          <p className="text-sm leading-6 text-white/62 sm:leading-7">
            Flashcards are still generating. Refresh in a moment. If generation
            takes too long, SyllabroAI will mark it as failed automatically.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!activeJob && flashcards.length === 0) {
    content = (
      <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
        <CardContent className="p-4 sm:p-8">
          <p className="text-sm leading-6 text-white/62 sm:leading-7">
            No flashcards found for this course yet. Generate flashcards from
            the course details page, then refresh here.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!activeJob && flashcards.length > 0) {
    content = <FlashcardStudyClient flashcards={flashcards} />;
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl space-y-4 sm:space-y-6">
      <div className="space-y-3">
        <Badge variant="secondary" className="w-fit">
          <BrainCircuit className="h-3.5 w-3.5" />
          Flashcard Study
        </Badge>

        <div className="space-y-2">
          <h1 className="break-words text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            {course.title}
          </h1>
          <p className="text-sm text-white/52">
            Click each card to reveal the answer.
          </p>
        </div>
      </div>

      {content}
      <AutoRefreshWhenGenerating enabled={Boolean(activeJob)} />

      <Button asChild variant="ghost" className="rounded-full">
        <Link href="/dashboard/flashcards">
          <ArrowLeft className="h-4 w-4" />
          Back to Flashcards
        </Link>
      </Button>
    </div>
  );
}

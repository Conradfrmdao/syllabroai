export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { ArrowRight, BrainCircuit, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { coursesTable, flashcardsTable, generationJobsTable } from "@/db/schema";
import { db } from "@/lib/db";
import {
  markGenerationJobCompleted,
  safelyMarkStaleGenerationJobs,
} from "@/lib/generation-jobs";
import AutoRefreshWhenGenerating from "@/components/realtime/AutoRefreshWhenGenerating";

function formatDate(date) {
  if (!date) {
    return "Unknown date";
  }

  return new Date(date).toLocaleDateString();
}

function groupFlashcards(rows) {
  const courseMap = new Map();

  for (const row of rows) {
    let group = courseMap.get(row.courseId);

    if (!group) {
      group = {
        courseId: row.courseId,
        courseTitle: row.courseTitle,
        count: 0,
        latestDate: row.createdAt,
      };

      courseMap.set(row.courseId, group);
    }

    group.count += 1;

    if (row.createdAt > group.latestDate) {
      group.latestDate = row.createdAt;
    }
  }

  return Array.from(courseMap.values());
}

export default async function FlashcardsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>You must be signed in to view flashcards.</div>;
  }

  await safelyMarkStaleGenerationJobs();

  let groupedCourses = [];
  let activeFlashcardJobs = [];
  let errorMessage = "";

  try {
    activeFlashcardJobs = await db
      .select()
      .from(generationJobsTable)
      .where(
        and(
          eq(generationJobsTable.userId, userId),
          eq(generationJobsTable.jobType, "flashcards"),
          eq(generationJobsTable.status, "generating")
        )
      );

    const rows = await db
      .select({
        courseId: flashcardsTable.courseId,
        courseTitle: coursesTable.title,
        createdAt: flashcardsTable.createdAt,
      })
      .from(flashcardsTable)
      .innerJoin(coursesTable, eq(flashcardsTable.courseId, coursesTable.id))
      .where(
        and(
          eq(flashcardsTable.userId, userId),
          eq(coursesTable.userId, userId)
        )
      )
      .orderBy(desc(flashcardsTable.createdAt));

    groupedCourses = groupFlashcards(rows);

    const groupedCourseIds = new Set();

    for (const course of groupedCourses) {
      groupedCourseIds.add(course.courseId);
    }

    const visibleJobs = [];

    for (const job of activeFlashcardJobs) {
      if (groupedCourseIds.has(job.courseId)) {
        await markGenerationJobCompleted(
          job.id,
          "Flashcards are ready."
        );
      } else {
        visibleJobs.push(job);
      }
    }

    activeFlashcardJobs = visibleJobs;
  } catch (error) {
    console.warn("Failed to fetch flashcards:", error?.message ?? error);
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

  if (
    !errorMessage &&
    groupedCourses.length === 0 &&
    activeFlashcardJobs.length === 0
  ) {
    content = (
      <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
        <CardContent className="p-4 sm:p-8">
          <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4 sm:rounded-[1.75rem] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-white">
                  No flashcards generated yet.
                </p>
                <p className="max-w-xl text-sm leading-6 text-white/56 sm:leading-7">
                  Generate flashcards from a saved course to start active
                  recall practice.
                </p>
              </div>

              <Button asChild>
                <Link href="/dashboard/courses?generate=flashcards">
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

  if (
    !errorMessage &&
    (groupedCourses.length > 0 || activeFlashcardJobs.length > 0)
  ) {
    content = (
      <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
        {activeFlashcardJobs.map((job) => (
          <Card key={job.id} className="glass-panel-strong rounded-[1.35rem] py-3 sm:rounded-[2rem] sm:py-4">
            <CardHeader className="space-y-3 border-b border-white/8 px-4 pb-4 sm:px-5 sm:pb-5">
              <Badge variant="outline" className="w-fit">
                Generating
              </Badge>
              <CardTitle className="text-lg sm:text-2xl">
                Flashcards are being generated
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <p className="text-sm leading-6 text-white/58 sm:leading-7">
                Refresh in a moment. If generation takes too long, SyllabroAI
                will mark it as failed instead of leaving it stuck forever.
              </p>
            </CardContent>
          </Card>
        ))}

        {groupedCourses.map((course) => (
          <Card
            key={course.courseId}
            className="glass-panel-strong rounded-[1.35rem] py-3 sm:rounded-[2rem] sm:py-4"
          >
            <CardHeader className="space-y-3 border-b border-white/8 px-4 pb-4 sm:px-5 sm:pb-5">
              <Badge variant="outline" className="w-fit">
                {course.count} cards
              </Badge>
              <CardTitle className="break-words text-lg sm:text-2xl">{course.courseTitle}</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className="text-sm text-white/52">
                Updated {formatDate(course.latestDate)}
              </p>

              <Button asChild variant="outline" className="rounded-full">
                <Link href={`/dashboard/flashcards/${course.courseId}`}>
                  Study Cards
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit">
            <BrainCircuit className="h-3.5 w-3.5" />
            Study tool
          </Badge>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              Flashcards
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-white/58 sm:text-base sm:leading-7">
              Turn important concepts from your courses into active recall
              flashcards.
            </p>
          </div>
        </div>

        <Button asChild>
          <Link href="/dashboard/courses?generate=flashcards">
            <Plus className="h-4 w-4" />
            Create Flashcards
          </Link>
        </Button>
      </div>

      {content}
      <AutoRefreshWhenGenerating enabled={activeFlashcardJobs.length > 0} />
    </div>
  );
}

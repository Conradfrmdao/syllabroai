export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, BookOpenText } from "lucide-react";

import GenerateExamButton from "@/components/forms/GenerateExamButton";
import GenerateFlashcardsButton from "@/components/forms/GenerateFlashcardsButton";
import GenerateQuizButton from "@/components/forms/GenerateQuizButton";
import DeleteCourseButton from "@/components/forms/DeleteCourseButton";
import AutoRefreshWhenGenerating from "@/components/realtime/AutoRefreshWhenGenerating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { coursesTable } from "@/db/schema";
import { db } from "@/lib/db";
import { safelyMarkStaleGenerationJobs } from "@/lib/generation-jobs";

function formatDate(date) {
  if (!date) {
    return "Unknown date";
  }

  return new Date(date).toLocaleDateString();
}

function getToolModeDetails(toolMode) {
  if (toolMode === "quiz") {
    return {
      title: "Create a quiz from this course",
      body: "Use the Generate Quiz button below. The quiz will be created from this course's saved chapters.",
    };
  }

  if (toolMode === "flashcards") {
    return {
      title: "Create flashcards from this course",
      body: "Use the Generate Flashcards button below. The cards will belong to this course.",
    };
  }

  if (toolMode === "exam") {
    return {
      title: "Create an exam from this course",
      body: "Use the Generate Exam button below. The exam will be generated from this course content.",
    };
  }

  return {
    title: "Create study tools for this course",
    body: "Quizzes, flashcards, and exams are generated from the chapters saved inside this course.",
  };
}

export default async function CourseDetailsPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const courseId = Number(resolvedParams.courseId);
  const toolMode = resolvedSearchParams?.generate;

  if (Number.isNaN(courseId)) {
    return <div>Invalid course ID</div>;
  }

  const { userId } = await auth();

  if (!userId) {
    return <div>Please log in to view course details</div>;
  }

  await safelyMarkStaleGenerationJobs();

  let course = null;
  let errorMessage = "";

  try {
    const result = await db
      .select()
      .from(coursesTable)
      .where(
        and(
          eq(coursesTable.id, courseId),
          eq(coursesTable.userId, userId)
        )
      )
      .limit(1);

    course = result[0];
  } catch (error) {
    console.warn("Failed to fetch course:", error?.message ?? error);
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

  const toolModeDetails = getToolModeDetails(toolMode);

  return (
    <div className="w-full space-y-6">
      <Card className="glass-panel-strong rounded-[2rem]">
        <CardHeader className="space-y-4 border-b border-white/8 pb-6">
          <Badge variant="secondary" className="w-fit">
            <BookOpenText className="h-3.5 w-3.5" />
            Course Details
          </Badge>

          <div className="space-y-3">
            <CardTitle className="text-3xl sm:text-4xl">
              {course.title}
            </CardTitle>
            <p className="max-w-3xl text-sm leading-7 text-white/58 sm:text-base">
              {course.description}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                Status
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {course.status}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                Created
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {formatDate(course.createdAt)}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-white">
              {toolModeDetails.title}
            </p>
            <p className="mt-1 text-sm leading-6 text-white/56">
              {toolModeDetails.body}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/dashboard/courses/${course.id}/chapters`}>
                View Chapters
              </Link>
            </Button>

            <GenerateQuizButton courseId={course.id} />
            <GenerateFlashcardsButton courseId={course.id} />
            <GenerateExamButton courseId={course.id} />
          </div>

          <div className="flex flex-col gap-3 border-t border-white/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/dashboard/courses">
                <ArrowLeft className="h-4 w-4" />
                Back to Courses
              </Link>
            </Button>

            <div className="w-full sm:w-auto">
              <DeleteCourseButton courseId={course.id} />
            </div>
          </div>
        </CardContent>
      </Card>
      <AutoRefreshWhenGenerating
        enabled={course.status === "pending" || course.status === "generating"}
      />
    </div>
  );
}

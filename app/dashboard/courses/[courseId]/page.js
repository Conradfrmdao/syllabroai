export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, BookOpenText } from "lucide-react";

import GenerateExamButton from "@/components/forms/GenerateExamButton";
import GenerateFlashcardsButton from "@/components/forms/GenerateFlashcardsButton";
import GenerateQuizButton from "@/components/forms/GenerateQuizButton";
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

export default async function CourseDetailsPage({ params }) {
  const resolvedParams = await params;
  const courseId = Number(resolvedParams.courseId);

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

          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/dashboard/courses">
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

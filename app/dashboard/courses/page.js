export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import {auth } from "@clerk/nextjs/server"; 
import Link from "next/link";
import { db } from "@/lib/db";
import { coursesTable } from "@/db/schema";
import { eq ,desc } from "drizzle-orm";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { safelyMarkStaleGenerationJobs } from "@/lib/generation-jobs";

export default async function CoursesPage() {
  let coursesList = [];
  let errorMessage = "";

  const { userId } = await auth();
  if (!userId) {
    return <div>You must be signed in to view courses.</div>;
  }

  await safelyMarkStaleGenerationJobs();

  try {
    coursesList = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.userId, userId))
      .orderBy(desc(coursesTable.createdAt));
  } catch (error) {
    console.warn("Failed to fetch courses:", error?.message ?? error);
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

  if (!errorMessage && coursesList.length === 0) {
    content = (
      <p className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4 text-white/62">
        No courses created yet.
      </p>
    );
  }

  if (!errorMessage && coursesList.length > 0) {
    content = (
      <div className="space-y-4">
        {coursesList.map((course) => {
          return (
            <Link
              key={course.id}
              href={`/dashboard/courses/${course.id}`}
              className="block"
            >
              <Card className="cursor-pointer transition hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {course.description}
                  </p>

                  <p className="text-sm">Status: {course.status}</p>

                  <p className="text-sm">
                    Created At:{" "}
                    {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Your Courses
        </h1>
        <p className="text-white/58">
          Browse every course you have generated and jump back into the next
          learning session quickly.
        </p>
      </div>
      {content}
    </div>
  );
}

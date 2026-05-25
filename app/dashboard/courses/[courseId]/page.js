export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { coursesTable } from "@/db/schema";

export default async function CourseDetailsPage({ params }) {
  const resolvedParams = await params;
  const courseId = Number(resolvedParams.courseId);

  if (Number.isNaN(courseId)) {
    return <div>Invalid course ID</div>;
  }

  const result = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, courseId))
    .limit(1);

  const course = result[0];

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Course Details</p>
        <h1 className="text-3xl font-bold">{course.title}</h1>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          {course.description}
        </p>

        <p className="mt-4 text-sm">Status: {course.status}</p>

        <p className="text-sm">
          Created: {new Date(course.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/dashboard/courses/${course.id}/chapters`}
          className="rounded-md border px-4 py-2 text-sm"
        >
          View Chapters
        </Link>

        <Link
          href="/dashboard/courses"
          className="rounded-md border px-4 py-2 text-sm"
        >
          Back to Courses
        </Link>
      </div>
    </div>
  );
}
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { chaptersTable, coursesTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export default async function CourseChaptersPage({ params }) {
  const resolvedParams = await params;
  const courseId = Number(resolvedParams.courseId);

  if (Number.isNaN(courseId)) {
    return <div>Invalid course ID</div>;
  }

  const courseResult = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, courseId))
    .limit(1);

  const course = courseResult[0];

  if (!course) {
    return <div>Course not found</div>;
  }

  const chaptersList = await db
    .select()
    .from(chaptersTable)
    .where(eq(chaptersTable.courseId, courseId))
    .orderBy(asc(chaptersTable.chapter_order));

  let content;

  if (chaptersList.length === 0) {
    content = (
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          No chapters found for this course yet.
        </p>
      </div>
    );
  }

  if (chaptersList.length > 0) {
    content = (
      <div className="space-y-4">
        {chaptersList.map((chapter) => {
          return (
            <Link
              key={chapter.id}
              href={`/dashboard/courses/${courseId}/chapters/${chapter.id}`}
              className="block"
            >
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Chapter {chapter.chapter_order}
                </p>

                <h2 className="text-xl font-semibold">{chapter.title}</h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {chapter.content}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Course Chapters</p>
        <h1 className="text-3xl font-bold">Chapters for {course.title}</h1>
      </div>

      {content}

      <Link
        href={`/dashboard/courses/${courseId}`}
        className="inline-block rounded-md border px-4 py-2 text-sm"
      >
        Back to Course
      </Link>
    </div>
  );
}
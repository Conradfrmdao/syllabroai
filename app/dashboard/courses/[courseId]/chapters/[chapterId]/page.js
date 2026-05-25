export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { chaptersTable, coursesTable } from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import Link from "next/link";

export default async function ChapterDetailsPage({ params }) {
  const resolvedParams = await params;

  const courseId = Number(resolvedParams.courseId);
  const chapterId = Number(resolvedParams.chapterId);

  if (Number.isNaN(courseId)) {
    return <div>Invalid course ID</div>;
  }

  if (Number.isNaN(chapterId)) {
    return <div>Invalid chapter ID</div>;
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

  const chapterResult = await db
    .select()
    .from(chaptersTable)
    .where(
      and(
        eq(chaptersTable.id, chapterId),
        eq(chaptersTable.courseId, courseId)
      )
    )
    .limit(1);

  const chapter = chapterResult[0];

  if (!chapter) {
    return <div>Chapter not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{course.title}</p>
        <h1 className="text-3xl font-bold">{chapter.title}</h1>

        <p className="text-sm text-muted-foreground">
          Chapter {chapter.chapter_order}
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <p className="leading-7">{chapter.content}</p>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/dashboard/courses/${courseId}/chapters`}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Back to Chapters
        </Link>

        <Link
          href={`/dashboard/courses/${courseId}`}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Back to Course
        </Link>
      </div>
    </div>
  );
}
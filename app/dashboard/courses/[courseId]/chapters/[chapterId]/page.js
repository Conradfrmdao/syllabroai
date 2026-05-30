export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import ChapterContentRenderer from "@/components/learning/ChapterContentRenderer";
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
  const { userId } = await auth();

  if (!userId) {
    return <div>You must be signed in to view this chapter.</div>;
  }

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
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="glass-panel-strong rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/52">{course.title}</p>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
              {chapter.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-sm text-white/54">
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                Learning Notes
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                Chapter {chapter.chapter_order}
              </span>
            </div>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white text-lg font-semibold text-black shadow-[0_18px_44px_-24px_rgba(255,255,255,0.32)]">
            {chapter.chapter_order}
          </div>
        </div>
      </div>

      <ChapterContentRenderer content={chapter.content} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/dashboard/courses/${courseId}/chapters`}
          className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/78 transition-all hover:border-white/22 hover:bg-white/[0.08] hover:text-white"
        >
          Back to Chapters
        </Link>

        <Link
          href={`/dashboard/courses/${courseId}`}
          className="inline-flex items-center justify-center rounded-full border border-white bg-white px-5 py-3 text-sm font-medium text-black transition-all hover:bg-white/90"
        >
          Back to Course
        </Link>
      </div>
    </div>
  );
}

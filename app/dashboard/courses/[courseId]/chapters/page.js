export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { db } from "@/lib/db";
import { chaptersTable, coursesTable } from "@/db/schema";
import { eq, asc,and } from "drizzle-orm";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function getChapterPreview(content) {
  if (!content) {
    return "Open this chapter to read the full learning notes.";
  }

  let preview = String(content);
  preview = preview.replace(/```[\s\S]*?```/g, " code example ");
  preview = preview.replace(/\*\*/g, "");
  preview = preview.replace(/`/g, "");
  preview = preview.replace(/\s+/g, " ");
  preview = preview.replace(/\d{1,2}[.)]\s+(Overview|Learning Objectives|Core Concepts|Step-by-Step Explanation|Practical Examples|Common Mistakes|Real-World Application|Practice Tasks|Quick Self-Test|Summary)/gi, "");
  preview = preview.trim();

  if (!preview) {
    return "Open this chapter to read the full learning notes.";
  }

  if (preview.length > 170) {
    preview = `${preview.slice(0, 170).trim()}...`;
  }

  return preview;
}

export default async function CourseChaptersPage({ params }) {
  const resolvedParams = await params;
  const courseId = Number(resolvedParams.courseId);

  if (Number.isNaN(courseId)) {
    return <div>Invalid course ID</div>;
  }

  const {userId} = await auth();

  if(!userId){
    return <div>You must be signed in to view chapters.</div>;
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

  const chaptersList = await db
    .select()
    .from(chaptersTable)
    .where(eq(chaptersTable.courseId, courseId))
    .orderBy(asc(chaptersTable.chapter_order));

  let content;

  if (chaptersList.length === 0) {
    content = (
      <Card className="glass-panel-strong rounded-[2rem]">
        <CardContent className="p-6">
          <p className="text-sm leading-7 text-white/62">
          No chapters found for this course yet.
        </p>
        </CardContent>
      </Card>
    );
  }

  if (chaptersList.length > 0) {
    content = (
      <div className="grid gap-4 xl:grid-cols-2">
        {chaptersList.map((chapter) => {
          const preview = getChapterPreview(chapter.content);

          return (
            <Link
              key={chapter.id}
              href={`/dashboard/courses/${courseId}/chapters/${chapter.id}`}
              className="block"
            >
              <Card className="glass-panel-strong h-full rounded-[2rem] transition hover:border-white/18 hover:bg-white/[0.05]">
                <CardContent className="flex h-full flex-col gap-4 p-5 sm:p-6">
                  <Badge variant="outline" className="w-fit">
                    Chapter {chapter.chapter_order}
                  </Badge>

                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold leading-tight text-white">
                      {chapter.title}
                    </h2>
                    <p className="max-h-[5.25rem] overflow-hidden text-sm leading-7 text-white/56">
                      {preview}
                    </p>
                  </div>

                  <div className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-white/72">
                    Open chapter
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-sm text-white/52">Course Chapters</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Chapters for {course.title}
        </h1>
      </div>

      {content}

      <Button asChild variant="ghost" className="rounded-full">
        <Link href={`/dashboard/courses/${courseId}`}>Back to Course</Link>
      </Button>
    </div>
  );
}

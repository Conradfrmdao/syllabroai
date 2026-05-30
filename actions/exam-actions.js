"use server";

import { asc, and, eq } from "drizzle-orm";

import { chaptersTable, coursesTable, examsTable } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { getOrCreateCurrentUser } from "@/lib/current-user";

function buildChapterPayload(chapters) {
  return chapters.map((chapter) => {
    return {
      title: chapter.title,
      content: chapter.content,
      chapter_order: chapter.chapter_order,
    };
  });
}

export async function generateExamForCourse(courseId) {
  const cleanCourseId = Number(courseId);

  if (Number.isNaN(cleanCourseId)) {
    return {
      success: false,
      message: "Invalid course ID.",
    };
  }

  const appUser = await getOrCreateCurrentUser();

  if (!appUser) {
    return {
      success: false,
      message: "You must be signed in to generate an exam.",
    };
  }

  const userId = appUser.clerkUserId;
  let examId = null;

  try {
    const courseResult = await db
      .select()
      .from(coursesTable)
      .where(
        and(
          eq(coursesTable.id, cleanCourseId),
          eq(coursesTable.userId, userId)
        )
      )
      .limit(1);

    const course = courseResult[0];

    if (!course) {
      return {
        success: false,
        message: "Course not found.",
      };
    }

    const chapters = await db
      .select()
      .from(chaptersTable)
      .where(eq(chaptersTable.courseId, cleanCourseId))
      .orderBy(asc(chaptersTable.chapter_order));

    if (chapters.length === 0) {
      return {
        success: false,
        message: "No chapters found for this course.",
      };
    }

    const insertedExams = await db
      .insert(examsTable)
      .values({
        userId: userId,
        courseId: cleanCourseId,
        title: `${course.title} Exam`,
        content: "Exam is generating.",
        markingGuide: "Marking guide is generating.",
        status: "generating",
      })
      .returning({
        id: examsTable.id,
      });

    const exam = insertedExams[0];

    if (!exam) {
      return {
        success: false,
        message: "Exam was not created. Please try again.",
      };
    }

    examId = exam.id;

    await inngest.send({
      name: "exam/generate.requested",
      data: {
        examId: examId,
        courseId: cleanCourseId,
        userId: userId,
        courseTitle: course.title,
        chapters: buildChapterPayload(chapters),
      },
    });
  } catch (error) {
    console.error("Failed to request exam generation:", error);

    if (examId) {
      try {
        await db
          .update(examsTable)
          .set({
            status: "failed",
          })
          .where(
            and(
              eq(examsTable.id, examId),
              eq(examsTable.userId, userId)
            )
          );
      } catch (updateError) {
        console.error("Failed to mark exam as failed:", updateError);
      }
    }

    return {
      success: false,
      message: "Failed to start exam generation. Please try again.",
    };
  }

  return {
    success: true,
    message: "Exam generation started.",
    examId: examId,
  };
}

export async function generateExamAction(prevState, formData) {
  const courseId = formData.get("courseId");
  return generateExamForCourse(courseId);
}

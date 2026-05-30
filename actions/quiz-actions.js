"use server";

import { asc, and, eq } from "drizzle-orm";

import { chaptersTable, coursesTable, quizzesTable } from "@/db/schema";
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

export async function generateQuizForCourse(courseId) {
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
      message: "You must be signed in to generate a quiz.",
    };
  }

  const userId = appUser.clerkUserId;
  let quizId = null;

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

    const insertedQuizzes = await db
      .insert(quizzesTable)
      .values({
        userId: userId,
        courseId: cleanCourseId,
        title: `${course.title} Quiz`,
        status: "generating",
      })
      .returning({
        id: quizzesTable.id,
      });

    const quiz = insertedQuizzes[0];

    if (!quiz) {
      return {
        success: false,
        message: "Quiz was not created. Please try again.",
      };
    }

    quizId = quiz.id;

    await inngest.send({
      name: "quiz/generate.requested",
      data: {
        quizId: quizId,
        courseId: cleanCourseId,
        userId: userId,
        courseTitle: course.title,
        chapters: buildChapterPayload(chapters),
      },
    });
  } catch (error) {
    console.error("Failed to request quiz generation:", error);

    if (quizId) {
      try {
        await db
          .update(quizzesTable)
          .set({
            status: "failed",
          })
          .where(
            and(
              eq(quizzesTable.id, quizId),
              eq(quizzesTable.userId, userId)
            )
          );
      } catch (updateError) {
        console.error("Failed to mark quiz as failed:", updateError);
      }
    }

    return {
      success: false,
      message: "Failed to start quiz generation. Please try again.",
    };
  }

  return {
    success: true,
    message: "Quiz generation started.",
    quizId: quizId,
  };
}

export async function generateQuizAction(prevState, formData) {
  const courseId = formData.get("courseId");
  return generateQuizForCourse(courseId);
}

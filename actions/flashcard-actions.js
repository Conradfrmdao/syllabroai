"use server";

import { asc, and, eq } from "drizzle-orm";

import { chaptersTable, coursesTable } from "@/db/schema";
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

export async function generateFlashcardsForCourse(courseId) {
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
      message: "You must be signed in to generate flashcards.",
    };
  }

  const userId = appUser.clerkUserId;

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

    await inngest.send({
      name: "flashcards/generate.requested",
      data: {
        courseId: cleanCourseId,
        userId: userId,
        courseTitle: course.title,
        chapters: buildChapterPayload(chapters),
      },
    });
  } catch (error) {
    console.error("Failed to request flashcard generation:", error);

    return {
      success: false,
      message: "Failed to start flashcard generation. Please try again.",
    };
  }

  return {
    success: true,
    message: "Flashcard generation started.",
    courseId: cleanCourseId,
  };
}

export async function generateFlashcardsAction(prevState, formData) {
  const courseId = formData.get("courseId");
  return generateFlashcardsForCourse(courseId);
}

"use server";

import { coursesTable, chaptersTable } from "@/db/schema";
import { db } from "@/lib/db";

export async function createCourse(prevState, formData) {
  const title = formData.get("title");
  const description = formData.get("description");

  if (typeof title !== "string" || typeof description !== "string") {
    return {
      success: false,
      message: "Invalid form data",
    };
  }

  const cleanTitle = title.trim();
  const cleanDescription = description.trim();

  if (!cleanTitle || cleanTitle.length <= 3) {
    return {
      success: false,
      message: "Title must be greater than 3 characters",
    };
  }

  if (cleanTitle.length > 120) {
    return {
      success: false,
      message: "Title must be less than 120 characters",
    };
  }

  if (!cleanDescription || cleanDescription.length < 20) {
    return {
      success: false,
      message: "Description must be greater than 20 characters",
    };
  }

  try {
    const insertedCourses = await db
      .insert(coursesTable)
      .values({
        userId: "temporary_user_id",
        title: cleanTitle,
        description: cleanDescription,
        status: "pending",
      })
      .returning({
        id: coursesTable.id,
      });

    const newCourse = insertedCourses[0];

    if (!newCourse) {
      return {
        success: false,
        message: "Course was not created. Please try again.",
      };
    }

    await db.insert(chaptersTable).values([
      {
        courseId: newCourse.id,
        title: "Introduction",
        content:
          "This is a sample introduction chapter. AI-generated notes will come later.",
        chapter_order: 1,
      },
      {
        courseId: newCourse.id,
        title: "Core Concepts",
        content: "This chapter will explain the main ideas of the course.",
        chapter_order: 2,
      },
      {
        courseId: newCourse.id,
        title: "Practice and Revision",
        content: "This chapter will help the learner revise and practice.",
        chapter_order: 3,
      },
    ]);
  } catch (error) {
    console.error("Failed to create course:", error);

    return {
      success: false,
      message: "Failed to create course. Please try again.",
    };
  }

  return {
    success: true,
    message: "Course and sample chapters created successfully.",
  };
}
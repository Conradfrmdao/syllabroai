"use server";

import { coursesTable, generationJobsTable } from "@/db/schema";
import { db } from "@/lib/db";
import { and, count, eq, gte } from "drizzle-orm";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { inngest } from "@/inngest/client";
import { markGenerationJobFailed } from "@/lib/generation-jobs";

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

  const appUser = await getOrCreateCurrentUser();

  if (!appUser) {
    return {
      success: false,
      message: "You must be signed in to create a course.",
    };
  }

  const userId = appUser.clerkUserId;
  const userPlan = appUser.plan;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  let createdCourseId = null;
  let generationJobId = null;

  try {
    const courseCountResult = await db
      .select({
        total: count(),
      })
      .from(coursesTable)
      .where(
        and(
          eq(coursesTable.userId, userId),
          gte(coursesTable.createdAt, weekStart)
        )
      );

    const coursesCreatedThisWeek = courseCountResult[0].total;

    const freeWeeklyLimit = 2;

    if (userPlan === "free") {
      if (coursesCreatedThisWeek >= freeWeeklyLimit) {
        return {
          success: false,
          message:
            "Free users can only create 2 courses per week. Upgrade to create more.",
        };
      }
    }

    const insertedCourses = await db
      .insert(coursesTable)
      .values({
        userId: userId,
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

    createdCourseId = newCourse.id;

    const insertedJobs = await db
      .insert(generationJobsTable)
      .values({
        userId: userId,
        courseId: createdCourseId,
        jobType: "course",
        status: "generating",
        targetId: createdCourseId,
        message: "Course generation started.",
      })
      .returning({
        id: generationJobsTable.id,
      });

    const generationJob = insertedJobs[0];

    if (generationJob) {
      generationJobId = generationJob.id;
    }

    await inngest.send({
      name: "course/generate.requested",
      data: {
        courseId: createdCourseId,
        jobId: generationJobId,
        userId: userId,
        title: cleanTitle,
        description: cleanDescription,
      },
    });
  } catch (error) {
    console.error("Failed to create course:", error);

    if (generationJobId) {
      try {
        await markGenerationJobFailed(
          generationJobId,
          "Course generation could not be started."
        );
      } catch (jobError) {
        console.error("Failed to mark course job as failed:", jobError);
      }
    }

    return {
      success: false,
      message: "Failed to create course. Please try again.",
    };
  }

  return {
    success: true,
    message: "Course generation started.",
    courseId: createdCourseId,
  };
}

import "server-only";

import { and, desc, eq, lt, or } from "drizzle-orm";

import {
  coursesTable,
  examsTable,
  generationJobsTable,
  quizzesTable,
} from "@/db/schema";
import { db } from "@/lib/db";

const GENERATION_TIMEOUT_MINUTES = 20;

function getTimeoutDate() {
  const timeoutDate = new Date();
  timeoutDate.setMinutes(timeoutDate.getMinutes() - GENERATION_TIMEOUT_MINUTES);

  return timeoutDate;
}

export function getGenerationTimeoutMessage(itemName = "generation") {
  return `This ${itemName} took longer than ${GENERATION_TIMEOUT_MINUTES} minutes and was marked as failed. Please try generating it again.`;
}

export async function markStaleGenerationJobs() {
  const timeoutDate = getTimeoutDate();
  const staleJobs = await db
    .select()
    .from(generationJobsTable)
    .where(
      and(
        eq(generationJobsTable.status, "generating"),
        lt(generationJobsTable.updatedAt, timeoutDate)
      )
    );

  for (const job of staleJobs) {
    await markGenerationJobFailed(
      job.id,
      getGenerationTimeoutMessage(job.jobType)
    );
  }

  const legacyCount = await markLegacyGeneratingRecords(timeoutDate);

  return staleJobs.length + legacyCount;
}

async function markLegacyGeneratingRecords(timeoutDate) {
  let markedCount = 0;

  const staleCourses = await db
    .update(coursesTable)
    .set({
      status: "failed",
    })
    .where(
      and(
        or(
          eq(coursesTable.status, "pending"),
          eq(coursesTable.status, "generating")
        ),
        lt(coursesTable.createdAt, timeoutDate)
      )
    )
    .returning({
      id: coursesTable.id,
    });

  markedCount += staleCourses.length;

  const staleQuizzes = await db
    .update(quizzesTable)
    .set({
      status: "failed",
    })
    .where(
      and(
        eq(quizzesTable.status, "generating"),
        lt(quizzesTable.createdAt, timeoutDate)
      )
    )
    .returning({
      id: quizzesTable.id,
    });

  markedCount += staleQuizzes.length;

  const staleExams = await db
    .update(examsTable)
    .set({
      status: "failed",
    })
    .where(
      and(
        eq(examsTable.status, "generating"),
        lt(examsTable.createdAt, timeoutDate)
      )
    )
    .returning({
      id: examsTable.id,
    });

  markedCount += staleExams.length;

  return markedCount;
}

export async function safelyMarkStaleGenerationJobs() {
  try {
    return await markStaleGenerationJobs();
  } catch (error) {
    console.warn("Failed to check stale generation jobs:", error?.message ?? error);
    return 0;
  }
}

export async function markGenerationJobCompleted(jobId, message = "Generation completed.") {
  if (!jobId) {
    return;
  }

  await db
    .update(generationJobsTable)
    .set({
      status: "completed",
      message: message,
      updatedAt: new Date(),
    })
    .where(eq(generationJobsTable.id, jobId));
}

export async function markGenerationJobFailed(jobId, message = "Generation failed.") {
  if (!jobId) {
    return;
  }

  const failedJobs = await db
    .update(generationJobsTable)
    .set({
      status: "failed",
      message: message,
      updatedAt: new Date(),
    })
    .where(eq(generationJobsTable.id, jobId))
    .returning();

  const failedJob = failedJobs[0];

  if (!failedJob) {
    return;
  }

  if (failedJob.jobType === "course") {
    await db
      .update(coursesTable)
      .set({
        status: "failed",
      })
      .where(
        and(
          eq(coursesTable.id, failedJob.courseId),
          eq(coursesTable.userId, failedJob.userId)
        )
      );
  }

  if (failedJob.jobType === "quiz" && failedJob.targetId) {
    await db
      .update(quizzesTable)
      .set({
        status: "failed",
      })
      .where(
        and(
          eq(quizzesTable.id, failedJob.targetId),
          eq(quizzesTable.userId, failedJob.userId)
        )
      );
  }

  if (failedJob.jobType === "exam" && failedJob.targetId) {
    await db
      .update(examsTable)
      .set({
        status: "failed",
      })
      .where(
        and(
          eq(examsTable.id, failedJob.targetId),
          eq(examsTable.userId, failedJob.userId)
        )
      );
  }
}

export async function getLatestGenerationJob(userId, courseId, jobType) {
  const jobs = await db
    .select()
    .from(generationJobsTable)
    .where(
      and(
        eq(generationJobsTable.userId, userId),
        eq(generationJobsTable.courseId, courseId),
        eq(generationJobsTable.jobType, jobType)
      )
    )
    .orderBy(desc(generationJobsTable.createdAt));

  if (jobs.length === 0) {
    return null;
  }

  return jobs[0];
}

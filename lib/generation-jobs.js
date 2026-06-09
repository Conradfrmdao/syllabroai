import "server-only";

import { and, desc, eq, lt, or } from "drizzle-orm";

import {
  coursesTable,
  examsTable,
  generationJobsTable,
  quizzesTable,
} from "@/db/schema";
import { db } from "@/lib/db";

const GENERATION_TIMEOUT_MINUTES = 90;

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
    .select({
      id: coursesTable.id,
      userId: coursesTable.userId,
    })
    .from(coursesTable)
    .where(
      and(
        or(
          eq(coursesTable.status, "pending"),
          eq(coursesTable.status, "generating")
        ),
        lt(coursesTable.createdAt, timeoutDate)
      )
    );

  for (const course of staleCourses) {
    const hasActiveJob = await hasActiveGenerationJob({
      userId: course.userId,
      courseId: course.id,
      jobType: "course",
    });

    if (hasActiveJob) {
      continue;
    }

    const failedCourses = await db
      .update(coursesTable)
      .set({
        status: "failed",
      })
      .where(
        and(
          eq(coursesTable.id, course.id),
          or(
            eq(coursesTable.status, "pending"),
            eq(coursesTable.status, "generating")
          )
        )
      )
      .returning({
        id: coursesTable.id,
      });

    markedCount += failedCourses.length;
  }

  const staleQuizzes = await db
    .select({
      id: quizzesTable.id,
      userId: quizzesTable.userId,
      courseId: quizzesTable.courseId,
    })
    .from(quizzesTable)
    .where(
      and(
        eq(quizzesTable.status, "generating"),
        lt(quizzesTable.createdAt, timeoutDate)
      )
    );

  for (const quiz of staleQuizzes) {
    const hasActiveJob = await hasActiveGenerationJob({
      userId: quiz.userId,
      courseId: quiz.courseId,
      jobType: "quiz",
      targetId: quiz.id,
    });

    if (hasActiveJob) {
      continue;
    }

    const failedQuizzes = await db
      .update(quizzesTable)
      .set({
        status: "failed",
      })
      .where(
        and(
          eq(quizzesTable.id, quiz.id),
          eq(quizzesTable.status, "generating")
        )
      )
      .returning({
        id: quizzesTable.id,
      });

    markedCount += failedQuizzes.length;
  }

  const staleExams = await db
    .select({
      id: examsTable.id,
      userId: examsTable.userId,
      courseId: examsTable.courseId,
    })
    .from(examsTable)
    .where(
      and(
        eq(examsTable.status, "generating"),
        lt(examsTable.createdAt, timeoutDate)
      )
    );

  for (const exam of staleExams) {
    const hasActiveJob = await hasActiveGenerationJob({
      userId: exam.userId,
      courseId: exam.courseId,
      jobType: "exam",
      targetId: exam.id,
    });

    if (hasActiveJob) {
      continue;
    }

    const failedExams = await db
      .update(examsTable)
      .set({
        status: "failed",
      })
      .where(
        and(
          eq(examsTable.id, exam.id),
          eq(examsTable.status, "generating")
        )
      )
      .returning({
        id: examsTable.id,
      });

    markedCount += failedExams.length;
  }

  return markedCount;
}

async function hasActiveGenerationJob({
  userId,
  courseId,
  jobType,
  targetId,
}) {
  const conditions = [
    eq(generationJobsTable.userId, userId),
    eq(generationJobsTable.courseId, courseId),
    eq(generationJobsTable.jobType, jobType),
    eq(generationJobsTable.status, "generating"),
  ];

  if (typeof targetId === "number") {
    conditions.push(eq(generationJobsTable.targetId, targetId));
  }

  const activeJobs = await db
    .select({
      id: generationJobsTable.id,
    })
    .from(generationJobsTable)
    .where(and(...conditions))
    .limit(1);

  return activeJobs.length > 0;
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

export async function markGenerationJobRunning(jobId, message = "Generation is still running.") {
  if (!jobId) {
    return;
  }

  await db
    .update(generationJobsTable)
    .set({
      status: "generating",
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

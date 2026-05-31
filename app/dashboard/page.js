export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { and, count, eq, gte } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  coursesTable,
  examsTable,
  flashcardsTable,
  quizQuestionsTable,
  quizzesTable,
  usersTable,
} from "@/db/schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function getTotal(result) {
  if (!result || result.length === 0) {
    return 0;
  }

  const firstRow = result[0];

  if (!firstRow || !firstRow.total) {
    return 0;
  }

  return Number(firstRow.total);
}

function MetricCard({ label, value, detail, featured = false }) {
  let cardClassName =
    "relative overflow-hidden rounded-[1.35rem] border border-white/14 bg-[linear-gradient(135deg,rgba(14,165,233,0.11),rgba(255,255,255,0.055)_42%,rgba(0,0,0,0.26))] py-3 shadow-[0_22px_70px_-52px_rgba(56,189,248,0.28)] sm:rounded-[2rem] sm:py-4";
  let valueClassName = "text-2xl font-semibold tracking-tight text-white sm:text-3xl";
  let detailClassName = "text-[0.68rem] leading-4 text-white/46 sm:text-xs sm:leading-5";

  if (featured) {
    cardClassName =
      "dot-matrix relative col-span-2 overflow-hidden rounded-[1.35rem] border border-white/16 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(255,255,255,0.07)_34%,rgba(0,0,0,0.3))] py-4 shadow-[0_30px_100px_-58px_rgba(56,189,248,0.45)] sm:rounded-[2rem] sm:py-5 md:col-span-2 xl:col-span-4";
    valueClassName = "text-4xl font-semibold tracking-tight text-white sm:text-6xl";
    detailClassName = "text-xs leading-5 text-white/52 sm:text-sm sm:leading-6";
  }

  return (
    <Card className={cardClassName}>
      <CardHeader className="px-3 pb-1 sm:px-5 sm:pb-2">
        <CardTitle className="text-[0.62rem] font-medium uppercase tracking-[0.14em] text-white/48 sm:text-xs sm:tracking-[0.2em]">
          {label}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 px-3 pb-0 sm:px-5">
        <p className={valueClassName}>{value}</p>
        <p className={detailClassName}>{detail}</p>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>You must be signed in to view the dashboard.</div>;
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  let totalCourses = 0;
  let coursesThisWeek = 0;
  let totalQuizzes = 0;
  let totalQuizQuestions = 0;
  let totalFlashcards = 0;
  let totalExams = 0;
  let plan = "free";
  let errorMessage = "";

  try {
    const totalCoursesResult = await db
      .select({
        total: count(),
      })
      .from(coursesTable)
      .where(eq(coursesTable.userId, userId));

    totalCourses = getTotal(totalCoursesResult);

    const weeklyCoursesResult = await db
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

    coursesThisWeek = getTotal(weeklyCoursesResult);

    const quizzesResult = await db
      .select({
        total: count(),
      })
      .from(quizzesTable)
      .where(eq(quizzesTable.userId, userId));

    totalQuizzes = getTotal(quizzesResult);

    const quizQuestionsResult = await db
      .select({
        total: count(),
      })
      .from(quizQuestionsTable)
      .innerJoin(quizzesTable, eq(quizQuestionsTable.quizId, quizzesTable.id))
      .where(eq(quizzesTable.userId, userId));

    totalQuizQuestions = getTotal(quizQuestionsResult);

    const flashcardsResult = await db
      .select({
        total: count(),
      })
      .from(flashcardsTable)
      .where(eq(flashcardsTable.userId, userId));

    totalFlashcards = getTotal(flashcardsResult);

    const examsResult = await db
      .select({
        total: count(),
      })
      .from(examsTable)
      .where(eq(examsTable.userId, userId));

    totalExams = getTotal(examsResult);

    const userResult = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, userId))
      .limit(1);

    const user = userResult[0];

    if (user && user.plan) {
      plan = user.plan;
    }
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    errorMessage = "Failed to load dashboard stats. Please refresh.";
  }

  const freeWeeklyLimit = 2;

  let weeklyLimit = freeWeeklyLimit;
  let limitText = "Free limit: 2 courses per week";

  if (plan !== "free") {
    weeklyLimit = 100;
    limitText = "Higher course limit";
  }

  let remainingCourses = weeklyLimit - coursesThisWeek;
  const totalStudyMaterials = totalQuizzes + totalFlashcards + totalExams;

  if (remainingCourses < 0) {
    remainingCourses = 0;
  }

  let content;

  if (errorMessage) {
    content = (
      <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
        {errorMessage}
      </p>
    );
  }

  if (!errorMessage) {
    content = (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-4">
        <MetricCard
          label="Courses Created"
          value={totalCourses}
          detail="Saved learning paths"
          featured={true}
        />

        <MetricCard
          label="Courses This Week"
          value={coursesThisWeek}
          detail={limitText}
        />

        <MetricCard
          label="Remaining Courses"
          value={remainingCourses}
          detail="Available on your current plan"
        />

        <MetricCard
          label="Quizzes Ready"
          value={totalQuizzes}
          detail="Generated quiz sets"
        />

        <MetricCard
          label="Quiz Questions"
          value={totalQuizQuestions}
          detail="Practice questions available"
        />

        <MetricCard
          label="Flashcards Ready"
          value={totalFlashcards}
          detail="Active recall cards"
        />

        <MetricCard
          label="Exams Ready"
          value={totalExams}
          detail="Structured exams generated"
        />

        <MetricCard
          label="Study Materials"
          value={totalStudyMaterials}
          detail="Quizzes, flashcards, and exams"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-5">
      <section className="flex justify-end">
        <Button asChild size="sm" className="sm:h-10 sm:px-4">
          <Link href="/dashboard/create-course">Create Course</Link>
        </Button>
      </section>

      {content}
    </div>
  );
}

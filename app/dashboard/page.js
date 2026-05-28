export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { and, count, eq, gte } from "drizzle-orm";

import { db } from "@/lib/db";
import { coursesTable, usersTable } from "@/db/schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>You must be signed in to view the dashboard.</div>;
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  let totalCourses = 0;
  let coursesThisWeek = 0;
  let plan = "free";
  let errorMessage = "";

  try {
    const totalCoursesResult = await db
      .select({
        total: count(),
      })
      .from(coursesTable)
      .where(eq(coursesTable.userId, userId));

    totalCourses = totalCoursesResult[0].total;

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

    coursesThisWeek = weeklyCoursesResult[0].total;

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Courses
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{totalCourses}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Courses This Week
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{coursesThisWeek}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Remaining Courses
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{remainingCourses}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {limitText}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Current Plan
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Badge>{plan}</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="text-white/58">
            Track your SyllabroAI learning materials.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/create-course">Create Course</Link>
        </Button>
      </section>

      {content}
    </div>
  );
}

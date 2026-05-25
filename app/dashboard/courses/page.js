export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { coursesTable } from "@/db/schema";
import { desc } from "drizzle-orm";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function CoursesPage() {
  const coursesList = await db
    .select()
    .from(coursesTable)
    .orderBy(desc(coursesTable.createdAt));

  let content;

  if (coursesList.length === 0) {
    content = <p>No courses created yet.</p>;
  }

  if (coursesList.length > 0) {
    content = (
      <div className="space-y-4">
        {coursesList.map((course) => {
          return (
            <Link
              key={course.id}
              href={`/dashboard/courses/${course.id}`}
              className="block"
            >
              <Card className="cursor-pointer transition hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {course.description}
                  </p>

                  <p className="text-sm">Status: {course.status}</p>

                  <p className="text-sm">
                    Created At:{" "}
                    {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Courses</h1>
      {content}
    </div>
  );
}
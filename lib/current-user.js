import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getOrCreateCurrentUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const existingUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUser.id))
    .limit(1);

  const existingUser = existingUsers[0];

  if (existingUser) {
    return existingUser;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress || "";

    let name = clerkUser.fullName;

    if (!name) {
      name = clerkUser.username;
    }

    if (!name) {
      name = clerkUser.firstName;
    }

    if (!name) {
      name = email;
    }

  const insertedUsers = await db
    .insert(usersTable)
    .values({
      clerkUserId: clerkUser.id,
      email: email,
      name: name,
      plan: "free",
    })
    .returning();

  return insertedUsers[0];
}

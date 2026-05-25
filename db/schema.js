import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),

  userId: varchar("user_id", { length: 255 }).notNull(),

  title: varchar("title", { length: 120 }).notNull(),

  description: text("description").notNull(),

  status: varchar("status", { length: 50 }).notNull().default("pending"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chaptersTable = pgTable("chapters", {
  id: serial("id").primaryKey(),

  courseId: integer("course_id")
    .notNull()
    .references(() => coursesTable.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 120 }).notNull(),

  content: text("content").notNull(),

  chapter_order: integer("chapter_order").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});
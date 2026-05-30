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

export const quizzesTable = pgTable("quizzes", {
  id: serial("id").primaryKey(),

  userId: varchar("user_id", { length: 255 }).notNull(),

  courseId: integer("course_id")
    .notNull()
    .references(() => coursesTable.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 150 }).notNull(),

  status: varchar("status", { length: 50 }).notNull().default("completed"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quizQuestionsTable = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),

  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzesTable.id, { onDelete: "cascade" }),

  question: text("question").notNull(),

  optionA: text("option_a").notNull(),

  optionB: text("option_b").notNull(),

  optionC: text("option_c").notNull(),

  optionD: text("option_d").notNull(),

  correctOption: varchar("correct_option", { length: 10 }).notNull(),

  explanation: text("explanation").notNull(),

  question_order: integer("question_order").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const flashcardsTable = pgTable("flashcards", {
  id: serial("id").primaryKey(),

  userId: varchar("user_id", { length: 255 }).notNull(),

  courseId: integer("course_id")
    .notNull()
    .references(() => coursesTable.id, { onDelete: "cascade" }),

  front: text("front").notNull(),

  back: text("back").notNull(),

  flashcard_order: integer("flashcard_order").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const examsTable = pgTable("exams", {
  id: serial("id").primaryKey(),

  userId: varchar("user_id", { length: 255 }).notNull(),

  courseId: integer("course_id")
    .notNull()
    .references(() => coursesTable.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 150 }).notNull(),

  content: text("content").notNull(),

  markingGuide: text("marking_guide").notNull(),

  status: varchar("status", { length: 50 }).notNull().default("completed"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),

  clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull().unique(),

  email: varchar("email", { length: 255 }).notNull(),

  name: varchar("name", { length: 255 }),

  plan: varchar("plan", { length: 50 }).notNull().default("free"),

  createdAt: timestamp("created_at").notNull().defaultNow(),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

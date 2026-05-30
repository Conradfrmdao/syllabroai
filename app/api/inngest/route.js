import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  generateExam,
  generateFlashcards,
  generateQuiz,
  testCourseGeneration,
} from "@/inngest/functions";

export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    testCourseGeneration,
    generateQuiz,
    generateFlashcards,
    generateExam,
  ],
});

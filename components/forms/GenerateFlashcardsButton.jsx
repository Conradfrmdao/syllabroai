"use client";

import Link from "next/link";
import { useActionState } from "react";
import { BrainCircuit, LoaderCircle } from "lucide-react";

import { generateFlashcardsAction } from "@/actions/flashcard-actions";
import { Button } from "@/components/ui/button";

const initialState = {
  success: false,
  message: "",
};

export default function GenerateFlashcardsButton({ courseId }) {
  const [state, formAction, isPending] = useActionState(
    generateFlashcardsAction,
    initialState
  );

  let messageClass =
    "rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100";

  if (state.success) {
    messageClass =
      "rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100";
  }

  let buttonText = "Generate Flashcards";

  if (isPending) {
    buttonText = "Starting flashcards...";
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="courseId" value={courseId} />

      <Button type="submit" disabled={isPending} className="w-full rounded-full">
        {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
        {!isPending && <BrainCircuit className="h-4 w-4" />}
        {buttonText}
      </Button>

      {state.message && (
        <div className={messageClass}>
          <p>{state.message}</p>
          {state.success && (
            <Link
              href={`/dashboard/flashcards/${courseId}`}
              className="mt-2 inline-block font-medium underline underline-offset-4"
            >
              Open flashcards
            </Link>
          )}
        </div>
      )}
    </form>
  );
}

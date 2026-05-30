"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileQuestion, LoaderCircle } from "lucide-react";

import { generateQuizAction } from "@/actions/quiz-actions";
import { Button } from "@/components/ui/button";

const initialState = {
  success: false,
  message: "",
};

export default function GenerateQuizButton({ courseId }) {
  const [state, formAction, isPending] = useActionState(
    generateQuizAction,
    initialState
  );
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.quizId) {
      router.push(`/dashboard/quizzes/${state.quizId}`);
    }
  }, [router, state]);

  let messageClass =
    "rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100";

  if (state.success) {
    messageClass =
      "rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100";
  }

  let buttonText = "Generate Quiz";

  if (isPending) {
    buttonText = "Starting quiz...";
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="courseId" value={courseId} />

      <Button type="submit" disabled={isPending} className="w-full rounded-full">
        {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
        {!isPending && <FileQuestion className="h-4 w-4" />}
        {buttonText}
      </Button>

      {state.message && <p className={messageClass}>{state.message}</p>}
    </form>
  );
}

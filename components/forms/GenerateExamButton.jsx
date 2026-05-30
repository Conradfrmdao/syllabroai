"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, LoaderCircle } from "lucide-react";

import { generateExamAction } from "@/actions/exam-actions";
import { Button } from "@/components/ui/button";

const initialState = {
  success: false,
  message: "",
};

export default function GenerateExamButton({ courseId }) {
  const [state, formAction, isPending] = useActionState(
    generateExamAction,
    initialState
  );
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.examId) {
      router.push(`/dashboard/exams/${state.examId}`);
    }
  }, [router, state]);

  let messageClass =
    "rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100";

  if (state.success) {
    messageClass =
      "rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100";
  }

  let buttonText = "Generate Exam";

  if (isPending) {
    buttonText = "Starting exam...";
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="courseId" value={courseId} />

      <Button type="submit" disabled={isPending} className="w-full rounded-full">
        {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
        {!isPending && <GraduationCap className="h-4 w-4" />}
        {buttonText}
      </Button>

      {state.message && <p className={messageClass}>{state.message}</p>}
    </form>
  );
}

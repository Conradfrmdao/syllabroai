"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, RotateCcw } from "lucide-react";

import { retryCourseGeneration } from "@/actions/course-actions";
import { Button } from "@/components/ui/button";

const initialState = {
  success: false,
  message: "",
};

export default function RetryCourseGenerationButton({ courseId }) {
  const [state, formAction, isPending] = useActionState(
    retryCourseGeneration,
    initialState
  );
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  let messageClass =
    "rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100";

  if (state.success) {
    messageClass =
      "rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100";
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="courseId" value={courseId} />

      <Button type="submit" disabled={isPending} className="w-full rounded-full sm:w-auto">
        {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
        {!isPending && <RotateCcw className="h-4 w-4" />}
        {isPending ? "Restarting..." : "Retry Generation"}
      </Button>

      {state.message && <p className={messageClass}>{state.message}</p>}
    </form>
  );
}

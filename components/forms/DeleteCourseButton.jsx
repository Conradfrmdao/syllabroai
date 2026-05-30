"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2, X } from "lucide-react";

import { deleteCourseAction } from "@/actions/course-actions";
import { Button } from "@/components/ui/button";

const initialState = {
  success: false,
  message: "",
};

export default function DeleteCourseButton({ courseId }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(
    deleteCourseAction,
    initialState
  );
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push("/dashboard/courses");
      router.refresh();
    }
  }, [router, state]);

  function handleShowConfirm() {
    setIsConfirming(true);
  }

  function handleCancel() {
    setIsConfirming(false);
  }

  if (!isConfirming) {
    return (
      <Button
        type="button"
        variant="destructive"
        className="w-full rounded-full"
        onClick={handleShowConfirm}
      >
        <Trash2 className="h-4 w-4" />
        Delete Course
      </Button>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-rose-400/20 bg-rose-400/10 p-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-rose-50">
          Delete this course?
        </p>
        <p className="text-xs leading-5 text-rose-100/72">
          This also removes its chapters, quizzes, flashcards, exams, and
          generation records.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <form action={formAction} className="w-full sm:w-auto">
          <input type="hidden" name="courseId" value={courseId} />
          <Button
            type="submit"
            variant="destructive"
            disabled={isPending}
            className="w-full rounded-full"
          >
            {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {!isPending && <Trash2 className="h-4 w-4" />}
            Confirm Delete
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full sm:w-auto"
          onClick={handleCancel}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>

      {state.message && (
        <p className="mt-3 text-xs leading-5 text-rose-100">
          {state.message}
        </p>
      )}
    </div>
  );
}

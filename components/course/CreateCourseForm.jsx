'use client'

import { useActionState } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpenText,
  BrainCircuit,
  FileQuestion,
  Layers3,
  LoaderCircle,
  Send,
  Sparkles,
} from "lucide-react";

import { createCourse } from "@/actions/course-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const initialState = {
  success: false,
  message: "",
};

const promptIdeas = [
  {
    label: "Beginner roadmap",
    prompt:
      "Make it beginner-friendly, structured week by week, and include short quizzes after each chapter.",
  },
  {
    label: "Interview prep",
    prompt:
      "Focus on practical interview preparation with exercises, reflection tasks, and revision flashcards.",
  },
  {
    label: "Project-based",
    prompt:
      "Build the course around projects, progressive difficulty, and a final capstone outcome.",
  },
];

const outputPills = [
  {
    label: "Chapter flow",
    icon: Layers3,
  },
  {
    label: "Quizzes",
    icon: FileQuestion,
  },
  {
    label: "Flashcards",
    icon: BrainCircuit,
  },
  {
    label: "Study notes",
    icon: BookOpenText,
  },
];

export default function CreateCourseForm() {
  const [state, formAction, isPending] = useActionState(createCourse, initialState);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const textareaRef = useRef(null);
  const router = useRouter();

  const adjustHeight = useCallback((reset = false) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    if (reset) {
      textarea.style.height = "84px";
      return;
    }

    textarea.style.height = "84px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }, []);

  useEffect(() => {
    if (state.success && state.courseId) {
      router.push(`/dashboard/courses/${state.courseId}`);
    }
  }, [router, state]);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight, description]);

  const handleInsertPrompt = (prompt) => {
    setDescription((current) => {
      if (!current.trim()) {
        return prompt;
      }

      return `${current}\n${prompt}`;
    });
  };

  return (
    <Card className="glass-panel-strong rounded-[2rem]">
      <CardHeader className="space-y-2 border-b border-white/8 p-4 pb-3 sm:p-5 sm:pb-3">
        <Badge variant="outline" className="w-fit">
          <Sparkles className="h-3.5 w-3.5" />
          Course builder
        </Badge>

        <div className="space-y-2">
          <CardTitle className="text-lg sm:text-xl">
            Create a structured course from a single prompt
          </CardTitle>
          <CardDescription className="max-w-2xl text-xs leading-5 text-white/54 sm:text-sm">
            Add a direct title, then describe the learner level, scope, and
            expected outcome.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <form action={formAction} className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="course-title" className="text-sm font-medium text-white/82">
              Course title
            </label>

            <Input
              id="course-title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: Product Design Interview Mastery"
              autoComplete="off"
              required
              maxLength={120}
              className="h-9 rounded-[1.1rem]"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Course prompt</p>
                <p className="text-xs text-white/42">
                  Describe what the learner should achieve and how the course
                  should feel.
                </p>
              </div>
            </div>

            <div
              className={cn(
                "rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-3 transition-all sm:p-4",
                isComposerFocused &&
                  "border-white/18 bg-white/[0.05] shadow-[0_24px_60px_-40px_rgba(255,255,255,0.12)]"
              )}
            >
              <Textarea
                ref={textareaRef}
                id="course-description"
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                onFocus={() => setIsComposerFocused(true)}
                onBlur={() => setIsComposerFocused(false)}
                placeholder="Example: Create an intermediate course for aspiring product designers who want to master interviews. Include a weekly structure, mock questions, mini quizzes, and flashcards for fast revision."
                required
                className="min-h-[84px] resize-none border-0 bg-transparent px-1 py-1 text-sm leading-6 shadow-none ring-0 focus-visible:border-transparent focus-visible:ring-0"
              />

              <div className="mt-2 flex flex-wrap gap-2">
                {promptIdeas.map((idea) => (
                  <button
                    key={idea.label}
                    type="button"
                    onClick={() => handleInsertPrompt(idea.prompt)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/68 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {idea.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex flex-col gap-3 border-t border-white/8 pt-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {outputPills.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-black/20 px-3 py-1.5 text-xs text-white/58"
                      >
                        <Icon className="h-3.5 w-3.5 text-white" />
                        {item.label}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isPending}
                    size="default"
                    className="min-w-[12rem] rounded-full"
                  >
                    {isPending ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isPending ? "Generating..." : "Generate Course"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {state.message && (
            <div
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm",
                state.success
                  ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
                  : "border-rose-400/20 bg-rose-400/10 text-rose-100"
              )}
            >
              {state.message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

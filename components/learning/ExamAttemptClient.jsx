"use client";

import { useState } from "react";
import { Eye, EyeOff, NotebookPen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExamAttemptClient({ exam }) {
  const [showMarkingGuide, setShowMarkingGuide] = useState(false);
  const [answerNotes, setAnswerNotes] = useState("");

  function handleShowGuide() {
    setShowMarkingGuide(true);
  }

  function handleHideGuide() {
    setShowMarkingGuide(false);
  }

  function handleNotesChange(event) {
    setAnswerNotes(event.target.value);
  }

  let guideButton = (
    <Button type="button" className="rounded-full" onClick={handleShowGuide}>
      <Eye className="h-4 w-4" />
      Show Marking Guide
    </Button>
  );

  if (showMarkingGuide) {
    guideButton = (
      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        onClick={handleHideGuide}
      >
        <EyeOff className="h-4 w-4" />
        Hide Marking Guide
      </Button>
    );
  }

  let markingGuideContent = null;

  if (showMarkingGuide) {
    markingGuideContent = (
      <Card className="glass-panel-strong rounded-[2rem]">
        <CardHeader className="border-b border-white/8 pb-5">
          <CardTitle className="text-2xl">Marking Guide</CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="whitespace-pre-wrap text-sm leading-8 text-white/72">
            {exam.markingGuide}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="glass-panel-strong rounded-[2rem]">
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/38">
              Attempt first
            </p>
            <h2 className="text-2xl font-semibold text-white">
              Work through the paper before checking answers.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-white/58">
              The marking guide is hidden until you choose to reveal it, so you
              can use this like a real self-study exam.
            </p>
          </div>

          {guideButton}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="glass-panel-strong rounded-[2rem]">
          <CardHeader className="border-b border-white/8 pb-5">
            <CardTitle className="text-2xl">Exam Paper</CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="whitespace-pre-wrap text-sm leading-8 text-white/72">
              {exam.content}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel-strong rounded-[2rem]">
          <CardHeader className="border-b border-white/8 pb-5">
            <div className="flex items-center gap-3">
              <NotebookPen className="h-5 w-5 text-white/62" />
              <CardTitle className="text-2xl">My Answer Notes</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <textarea
              value={answerNotes}
              onChange={handleNotesChange}
              placeholder="Write rough answers or thoughts here. These notes stay local and are not saved yet."
              className="min-h-[22rem] w-full resize-none rounded-[1.5rem] border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/30 focus:border-white/24 focus:bg-black/40"
            />
          </CardContent>
        </Card>
      </div>

      {markingGuideContent}
    </div>
  );
}

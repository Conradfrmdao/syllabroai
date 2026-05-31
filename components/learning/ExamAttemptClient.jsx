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
      <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
        <CardHeader className="border-b border-white/8 px-4 pb-4 sm:px-5 sm:pb-5">
          <CardTitle className="text-xl sm:text-2xl">Marking Guide</CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto whitespace-pre-wrap break-words text-sm leading-6 text-white/72 sm:leading-8">
            {exam.markingGuide}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="min-w-0 space-y-2">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/38 sm:text-xs sm:tracking-[0.2em]">
              Attempt first
            </p>
            <h2 className="break-words text-xl font-semibold text-white sm:text-2xl">
              Work through the paper before checking answers.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-white/58 sm:leading-7">
              The marking guide is hidden until you choose to reveal it, so you
              can use this like a real self-study exam.
            </p>
          </div>

          {guideButton}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
          <CardHeader className="border-b border-white/8 px-4 pb-4 sm:px-5 sm:pb-5">
            <CardTitle className="text-xl sm:text-2xl">Exam Paper</CardTitle>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <div className="overflow-x-auto whitespace-pre-wrap break-words text-sm leading-6 text-white/72 sm:leading-8">
              {exam.content}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel-strong rounded-[1.35rem] sm:rounded-[2rem]">
          <CardHeader className="border-b border-white/8 px-4 pb-4 sm:px-5 sm:pb-5">
            <div className="flex items-center gap-3">
              <NotebookPen className="h-5 w-5 text-white/62" />
              <CardTitle className="text-xl sm:text-2xl">My Answer Notes</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <textarea
              value={answerNotes}
              onChange={handleNotesChange}
              placeholder="Write rough answers or thoughts here. These notes stay local and are not saved yet."
              className="min-h-[14rem] w-full resize-none rounded-[1.25rem] border border-white/10 bg-black/30 p-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-white/24 focus:bg-black/40 sm:min-h-[22rem] sm:rounded-[1.5rem] sm:p-4 sm:leading-7"
            />
          </CardContent>
        </Card>
      </div>

      {markingGuideContent}
    </div>
  );
}

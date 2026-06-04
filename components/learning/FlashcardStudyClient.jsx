"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function FlashcardStudyClient({ flashcards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/58">
        No flashcards found.
      </p>
    );
  }

  const currentFlashcard = flashcards[currentIndex];
  const totalCards = flashcards.length;
  const cardNumber = currentIndex + 1;
  function handleFlip() {
    setShowBack((current) => {
      return !current;
    });
  }

  function handlePrevious() {
    if (currentIndex === 0) {
      return;
    }

    setCurrentIndex(currentIndex - 1);
    setShowBack(false);
  }

  function handleNext() {
    if (currentIndex >= totalCards - 1) {
      return;
    }

    setCurrentIndex(currentIndex + 1);
    setShowBack(false);
  }

  function handleReset() {
    setCurrentIndex(0);
    setShowBack(false);
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/52">
          Card {cardNumber} of {totalCards}
        </p>

        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
          Restart
        </Button>
      </div>

      <button
        type="button"
        onClick={handleFlip}
        aria-label={showBack ? "Show question side" : "Show answer side"}
        className="group h-[clamp(18rem,52dvh,24rem)] w-full [perspective:1200px] sm:h-[28rem] lg:h-[30rem]"
      >
        <span
          className={`relative block h-full w-full rounded-[1.35rem] text-left shadow-[0_28px_90px_-44px_rgba(0,0,0,1)] transition-transform duration-500 ease-out [transform-style:preserve-3d] motion-reduce:transition-none sm:rounded-[2rem] ${
            showBack ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <span className="absolute inset-0 flex min-h-0 flex-col rounded-[1.35rem] border border-white/12 bg-white/[0.05] p-5 transition-colors [backface-visibility:hidden] group-hover:bg-white/[0.07] sm:rounded-[2rem] sm:p-8">
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-white/38 sm:text-xs sm:tracking-[0.22em]">
              Question
            </span>
            <span className="mt-4 block min-h-0 flex-1 overflow-y-auto break-words pr-1 text-xl font-semibold leading-8 text-white sm:mt-6 sm:text-2xl sm:leading-10 lg:text-3xl lg:leading-relaxed">
              {currentFlashcard.front}
            </span>
            <span className="shrink-0 pt-5 text-sm text-white/42 sm:pt-8">
              Click the card to reveal the answer.
            </span>
          </span>

          <span className="absolute inset-0 flex min-h-0 flex-col rounded-[1.35rem] border border-emerald-300/20 bg-emerald-300/[0.08] p-5 transition-colors [backface-visibility:hidden] [transform:rotateY(180deg)] group-hover:bg-emerald-300/[0.1] sm:rounded-[2rem] sm:p-8">
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-emerald-100/58 sm:text-xs sm:tracking-[0.22em]">
              Answer
            </span>
            <span className="mt-4 block min-h-0 flex-1 overflow-y-auto break-words pr-1 text-lg font-semibold leading-7 text-white sm:mt-6 sm:text-2xl sm:leading-10">
              {currentFlashcard.back}
            </span>
            <span className="shrink-0 pt-5 text-sm text-emerald-50/50 sm:pt-8">
              Click the card to return to the question.
            </span>
          </span>
        </span>
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button
          type="button"
          className="rounded-full"
          onClick={handleFlip}
        >
          <RotateCw className="h-4 w-4" />
          Flip Card
        </Button>

        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={handleNext}
          disabled={currentIndex >= totalCards - 1}
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

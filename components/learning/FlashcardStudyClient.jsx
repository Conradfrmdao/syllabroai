"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

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
  let cardLabel = "Question";
  let cardText = currentFlashcard.front;

  if (showBack) {
    cardLabel = "Answer";
    cardText = currentFlashcard.back;
  }

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
        className="min-h-[14rem] w-full rounded-[1.35rem] border border-white/12 bg-white/[0.05] p-5 text-left shadow-[0_28px_90px_-44px_rgba(0,0,0,1)] transition hover:bg-white/[0.07] sm:min-h-[20rem] sm:rounded-[2rem] sm:p-8"
      >
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-white/38 sm:text-xs sm:tracking-[0.22em]">
          {cardLabel}
        </p>
        <p className="mt-4 break-words text-xl font-semibold leading-8 text-white sm:mt-6 sm:text-3xl sm:leading-relaxed">
          {cardText}
        </p>
        <p className="mt-5 text-sm text-white/42 sm:mt-8">
          Click the card to reveal the other side.
        </p>
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

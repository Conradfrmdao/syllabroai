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
    <div className="space-y-5">
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
        className="min-h-[20rem] w-full rounded-[2rem] border border-white/12 bg-white/[0.05] p-8 text-left shadow-[0_28px_90px_-44px_rgba(0,0,0,1)] transition hover:bg-white/[0.07]"
      >
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/38">
          {cardLabel}
        </p>
        <p className="mt-6 text-2xl font-semibold leading-relaxed text-white sm:text-3xl">
          {cardText}
        </p>
        <p className="mt-8 text-sm text-white/42">
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

"use client";

import React, { memo, useEffect } from "react";
import { useQuizTimer } from "@/hooks/useQuizTimer";
import { TimerProgressBar } from "./TimerProgressBar";

type QuizTimerSectionProps = {
  onTimeExpired: () => void;
  isRunning: boolean;
  currentQuestionIndex: number;
  score: number;
};

export const QuizTimerSection = memo((props: QuizTimerSectionProps) => {
  const { onTimeExpired, isRunning, currentQuestionIndex, score } = props;

  const { progress, resetTimer } = useQuizTimer({
    onTimeExpired,
    isRunning,
  });

  // 問題が変わったらタイマーリセット
  useEffect(() => {
    resetTimer();
  }, [currentQuestionIndex, resetTimer]);

  return (
    <div className="my-4 flex items-center justify-between gap-2">
      <TimerProgressBar progress={progress} />
      <span className="font-mono text-xs text-white">Score: {score}</span>
    </div>
  );
});

QuizTimerSection.displayName = "QuizTimerSection";

"use client";

import { memo, useEffect } from "react";
import { useQuizTimer } from "@/hooks/useQuizTimer";
import { TimerProgressBar } from "./TimerProgressBar";

type QuizTimerSectionProps = {
  onTimeExpired: () => void;
  isRunning: boolean;
  currentQuestionIndex: number;
  score: number;
};

export const QuizTimerSection = memo((props: QuizTimerSectionProps) => {
  const { onTimeExpired, isRunning, score } = props;

  const { progress, resetTimer } = useQuizTimer({
    onTimeExpired,
    isRunning,
  });

  // 問題が変わったらタイマーリセット
  useEffect(() => {
    resetTimer();
  }, [resetTimer]);

  return (
    <div className="my-4 flex items-center justify-between gap-2">
      <TimerProgressBar progress={progress} />
      <span className="font-mono text-white text-xs">Score: {score}</span>
    </div>
  );
});

QuizTimerSection.displayName = "QuizTimerSection";

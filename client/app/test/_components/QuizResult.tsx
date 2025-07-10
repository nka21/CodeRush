import React from "react";
import type { QuizResult } from "../_types/quiz";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

type QuizResultProps = {
  result: QuizResult;
};

export const QuizResultScreen = (props: QuizResultProps) => {
  const { result } = props;

  const router = useRouter();

  return (
    <div className="text-center">
      <h2 className="mb-4 text-2xl font-bold text-green-400">QUIZ COMPLETE!</h2>
      <p className="text-lg text-white">
        Score: {result.score} / {result.totalQuestions}
      </p>
      <p className="mt-2 text-gray-400">正答率: {result.accuracyPercentage}%</p>
      <div className="mt-6">
        <Button context="game" onClick={() => router.push("/")} label="戻る" />
      </div>
    </div>
  );
};

import React from "react";
import type { QuizResult } from "../_types/quiz";

type QuizResultProps = {
  result: QuizResult;
};

export const QuizResultScreen = (props: QuizResultProps) => {
  const { result } = props;

  const getPerformanceMessage = () => {
    if (result.accuracyPercentage >= 80) return "素晴らしい成績です！";
    if (result.accuracyPercentage >= 60) return "よくできました！";
    if (result.accuracyPercentage >= 40) return "もう少し頑張りましょう！";
    return "次回はもっと良い結果を目指しましょう！";
  };

  return (
    <div className="text-center">
      <h2 className="mb-4 text-2xl font-bold text-green-400">QUIZ COMPLETE!</h2>
      <p className="text-lg text-white">
        Score: {result.score} / {result.totalQuestions}
      </p>
      <p className="mt-2 text-gray-400">正答率: {result.accuracyPercentage}%</p>
      <p className="mt-4 text-gray-300">{getPerformanceMessage()}</p>
    </div>
  );
};

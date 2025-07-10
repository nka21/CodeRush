import React from "react";
import type { QuizResult } from "../_types/quiz";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

type QuizResultProps = {
  result: QuizResult;
};

const rankIcons = ["★", "◆", "▲", "●"];
const rankColors = [
  "text-yellow-400 font-bold", // 1位
  "text-cyan-400",             // 2位
  "text-yellow-700",           // 3位
  "text-green-400",            // 4位以降
];

// ダミーデータ
// 実際のアプリではサーバーから取得することを想定
const players = [
  {name: 'Kazuya', score: 120 },
  {name: 'Soma', score: 95 },
  {name: 'Yuki', score: 110 },
];


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

<div className="border-t border-green-700 my-4" />
      <div className="mb-2 text-green-400 font-bold">FINAL RANKINGS</div>
      <pre className="bg-black/60 rounded p-4 mb-4">
        {players.map((player, idx) => (
          <div
            key={player.name}
            className={`flex items-center gap-2 py-1 ${rankColors[idx] || rankColors[3]}`}
          >
            <span>{rankIcons[idx] || rankIcons[3]}</span>
            <span className="flex-1">{player.name}</span>
            <span className="ml-2">{player.score} pts</span>
          </div>
        ))}
      </pre>


	  
      <div className="mt-1">
        <Button context="game" onClick={() => router.push("/")} label="戻る" />
        <Button context="game" onClick={() => router.push("/")} label="問題の確認" />
      </div>
    </div>
  );
};

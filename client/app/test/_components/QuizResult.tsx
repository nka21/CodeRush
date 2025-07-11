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
  {name: 'ぺんぺん', score: 200 }
];


export const QuizResultScreen = (props: QuizResultProps) => {
  const { result } = props;
  const router = useRouter();
  
  const rank:number = 1; //暫定順位

  return (
    <div className="text-center">
      <h1 className="font-sixtyfour typing-text text-4xl font-bold text-green-400 md:text-5xl my-5">
          {rank === 1 ? "CHAMPION" : "GAME OVER"}
        </h1>

<div className="border-t border-green-700 my-4" />
      <div className="text-green-400 font-bold">FINAL RANKINGS</div>
      <pre className="bg-black/60 rounded p-4 mb-3">
        {players.map((player, idx) => (
          <div
            key={player.name}
            className={`flex items-center gap-2 py-1 ${rankColors[idx] || rankColors[3]}`}
          >
            <span>{rankIcons[idx] || rankIcons[3]}</span>
            <span className="flex-1">{player.name}</span>
            <span className="ml-2">{result.score} pts</span>
          </div>
        ))}
      </pre>


	  
      <div className="mt-1 flex-col flex gap-3">
        <Button onClick={() => router.push("/")} shortcutKey={1} label=" cd ~/ && ./home" description="ホームに戻る"/>
        <Button onClick={() => router.push("/")} shortcutKey={2} label="cat ./question.log" description="問題の確認" />
      </div>
    </div>
  );
};

import React from "react";
import type { QuizResult } from "../_types/quiz";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { useState, useEffect } from "react";

const rankIcons = "◆";
const rankColors = [
  "text-yellow-400 font-bold",        
  "text-gray-400 font-bold",            
  "text-yellow-700 font-bold",           
  "text-cane-900 font-bold",             
];

type QuizResultProps = {
  result: QuizResult;
};


// ダミーデータ
// const players = [
//   {name: 'Player 1', score: 90, rank:1 },
//   {name: 'Player 2', score: 90, rank:1 },
//   {name: 'Player 3', score: 50, rank:3 },
//   {name: 'Player 4', score: 30, rank:4 }
// ];

export const QuizResultScreen = (props: QuizResultProps) => {
  const { result } = props;
  const router = useRouter();
  
  const [players, setPlayers] = useState<{ name: string; score: number; rank: number}[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const res = await fetch(`/result/${42}`); // 実際のAPI URLに置き換え
        // const data = await res.json();
        
        const data = {
          "roomId": 42,
          "players": {
            "abc123": { "name": "Player 2", "score": 90, "rank": 1 },
            "def456": { "name": "Player 1", "score": 80, "rank": 2 },
            "ghi789": { "name": "Player 3", "score": 30, "rank": 3 },
            "pen789": { "name": "Player 4", "score": 30, "rank": 4 }
          }
        }
        const playerArray = Object.values(data.players) as { name: string; score: number; rank:number}[];
        
        setPlayers(playerArray);
      } catch (err) {
        console.error("プレイヤーデータの取得に失敗しました:", err);
      }
    };
    
    fetchData();
  }, []);

  const myId = "Player 1"; //情報受け取り必要
  const myPlayer = players.find((player) => player.name === myId);

  if (!myPlayer) {
  console.error("自分のプレイヤーデータが見つかりません");
  return null;
}
  const myRank:number = myPlayer.rank;
  
  return (
    <div className="text-center">
      <h1 className="font-sixtyfour typing-text text-4xl font-bold text-green-400 md:text-5xl my-5">
          {myRank === 1 ? "WIN" : "GAME OVER"}
        </h1>

<div className="border-t border-green-700 my-4" />
      <div className="text-green-400 font-bold">FINAL RANKINGS</div>
      <pre className="bg-black/60 rounded p-4 mb-3">
        {players.map((player) => (
          <div
            key={player.name}
            className={`flex items-center gap-2 py-1 ${rankColors[player.rank - 1]}`}
          >
            <span>{rankIcons}</span>
            <span className="flex-1">{player.name}</span>
            <span className="ml-2">{player.score} pts</span>
          </div>
        ))}
      </pre>


	  
      <div className="mt-1 flex-col flex gap-3">
        <Button onClick={() => router.push("/")} shortcutKey={1} label="cd ~/ && ./room" description="// 待機画面に戻る"/>
        <Button onClick={() => router.push("/")} shortcutKey={2} label="cat ./question.log" description="// 問題の確認" />
      </div>
    </div>
  );
};

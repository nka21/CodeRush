import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import type { QuizResult } from "../../_types/quiz";

const rankIcons = "◆";

type QuizResultScreenProps = {
  result?: QuizResult;
  onShowQuestionLog?: () => void;
  onReturnToLobby?: () => void;
};

export const QuizResultScreen = (props: QuizResultScreenProps) => {
  const { result, onShowQuestionLog, onReturnToLobby } = props;
  const router = useRouter();

  // 結果データがない場合のフォールバック
  const displayResult = result || {
    score: 0,
    totalQuestions: 100,
    accuracyPercentage: 0,
  };

  // 現在はシングルプレイヤーモードとして扱う
  const playerName = ["Player 1", "Player 2"];
  const isWinner = displayResult.accuracyPercentage >= 70; // 70%以上で勝利とする

  return (
    <div className="text-center">
      <h1 className="font-sixtyfour typing-text my-5 text-4xl font-bold text-green-400 md:text-5xl">
        {isWinner ? "WIN" : "GAME OVER"}
      </h1>

      <div className="my-4 border-t border-green-700" />
      <div className="font-bold text-green-400">FINAL RESULT</div>
      <pre className="mb-3 rounded bg-black/60 p-4">
        <div className="flex items-center gap-2 py-1 text-green-400">
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <span>{rankIcons}</span>
              <span className="flex-1">{playerName[0]}</span>
              <span className="ml-2">
                {displayResult.score}/{displayResult.totalQuestions}
              </span>
            </div>
            <div className="text-center">
              <span>{rankIcons}</span>
              <span className="flex-1">{playerName[1]}</span>
              <span className="ml-2">
                {displayResult.score}/{displayResult.totalQuestions}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-2 text-yellow-400">
          Accuracy: {displayResult.accuracyPercentage}%
        </div>
      </pre>

      <div className="mt-1 flex flex-col gap-3">
        <Button
          onClick={onReturnToLobby || (() => router.push("/"))}
          shortcutKey={1}
          label="cd ~/ && ./room"
          description="// 待機画面に戻る"
        />
        <Button
          onClick={onShowQuestionLog || (() => router.push("/question_log"))}
          shortcutKey={2}
          label="cat ./question.log"
          description="// 問題の確認"
        />
      </div>
    </div>
  );
};

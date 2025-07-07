"use client";

import { Button } from "@/components/Button";
import { TerminalLayout } from "@/components/TerminalLayout";
import { useState, useEffect, useCallback } from "react";
import mockData from "./_mock/mock.json";
import type { Question } from "./_types/quiz";
import React from "react";

export default function TestPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null); // 不正解アニメーションのため
  const [hasAnswered, setHasAnswered] = useState<boolean>(false); // Loading Animetion のため
  const [score, setScore] = useState<number>(0);

  // 制限時間用の状態
  const [timeRemaining, setTimeRemaining] = useState<number>(30000); // 30秒をミリ秒で管理
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  const questions: Question[] = mockData.questions as Question[];

  const isQuizComplete = currentQuestionIndex >= questions.length;

  // 現在の問題を安全に取得
  const currentQuestion = isQuizComplete
    ? null
    : questions[currentQuestionIndex];

  /**
   * 次の問題へ進む処理
   */
  const moveToNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setTimeRemaining(30000); // タイマーをリセット
  }, []);

  /**
   * 時間切れ時の処理
   */
  const handleTimeUp = useCallback(() => {
    setHasAnswered(true);
    setSelectedAnswer(-1); // -1で時間切れを表現

    // 2秒後に次の問題へ
    setTimeout(() => {
      moveToNextQuestion();
    }, 2000);
  }, [moveToNextQuestion]);

  /**
   * ボタンがクリックされた時の処理
   */
  const handleAnswerClick = useCallback(
    (choiceIndex: number) => {
      // すでに回答済みの場合は何もしない
      if (hasAnswered) return;

      // 選択した答えを保存
      setSelectedAnswer(choiceIndex);
      setHasAnswered(true);

      // 正解かどうかチェック
      const isCorrect =
        choiceIndex === questions[currentQuestionIndex].correctAnswer;
      if (isCorrect) {
        setScore((prev) => prev + 1);
      }

      // 2秒後に次の問題へ進む
      setTimeout(() => {
        moveToNextQuestion();
      }, 2000);
    },
    [hasAnswered, questions, currentQuestionIndex, moveToNextQuestion],
  );

  /**
   * 各ボタンのスタイルを決定する関数
   * @param index - ボタンのインデックス
   * @returns 追加するCSSクラス名
   */
  const getButtonStyle = (index: number): string => {
    // まだ回答していない場合は通常のスタイル
    if (!hasAnswered) return "";

    // 時間切れの場合
    if (selectedAnswer === -1) {
      // 正解のボタンのみ緑色で表示
      if (index === questions[currentQuestionIndex].correctAnswer) {
        return "animate-pulse border-green-500 bg-green-500/20";
      }
      // その他は薄暗く
      return "opacity-50";
    }

    // 正解のボタン
    if (index === questions[currentQuestionIndex].correctAnswer) {
      return "animate-pulse border-green-500 bg-green-500/20";
    }

    // 不正解のボタン
    if (index === selectedAnswer) {
      return "animate-shake border-red-500 bg-red-500/20";
    }

    // その他のボタン（薄暗くする）
    return "opacity-50";
  };

  /**
   * プログレスバーの色を残り問題数に応じて決定する関数
   * @returns プログレスバーのCSSクラス名
   */
  const getProgressBarColor = (): string => {
    const remainingQuestions = questions.length - currentQuestionIndex;
    const remainingPercentage = remainingQuestions / questions.length;

    if (remainingPercentage > 2 / 3) {
      // 残り2/3以上：緑色（安全）
      return "bg-gradient-to-r from-green-500 to-green-400";
    } else if (remainingPercentage > 1 / 3) {
      // 残り1/3〜2/3：黄色（注意）
      return "bg-gradient-to-r from-yellow-500 to-yellow-400";
    } else {
      // 残り1/3以下：赤色（危険）
      return "bg-gradient-to-r from-red-500 to-red-400";
    }
  };

  /**
   * ターミナル風ASCIIプログレスバーを生成
   * @returns ASCII文字で構成されたプログレスバー文字列
   */
  const getTerminalProgressBar = (): React.ReactNode => {
    const timeProgress = timeRemaining / 30000; // 0〜1の範囲
    const totalBars = 30; // プログレスバーの全体長
    const filledBars = Math.floor(timeProgress * totalBars);

    // 時間に応じて色を決定
    let colorClass = "text-green-400";
    if (timeRemaining <= 10000) {
      colorClass = "text-red-400";
    } else if (timeRemaining <= 20000) {
      colorClass = "text-yellow-400";
    }

    return (
      <div className="flex flex-1 overflow-hidden font-mono">
        {Array.from({ length: totalBars }, (_, i) => {
          const filled = i < filledBars;
          return (
            <span key={i} className={`flex-1 ${colorClass}`}>
              {filled ? "▓" : "░"}
            </span>
          );
        })}
      </div>
    );
  };

  /**
   * 滑らかなプログレスバーの色を決定
   * @returns CSSクラス名
   */
  const getSmoothProgressColor = (): string => {
    if (timeRemaining <= 10000) {
      return "bg-gradient-to-r from-red-500 to-red-400"; // 残り10秒以下：赤色
    } else if (timeRemaining <= 20000) {
      return "bg-gradient-to-r from-yellow-500 to-yellow-400"; // 残り20秒以下：黄色
    }
    return "bg-gradient-to-r from-green-500 to-green-400"; // デフォルト：緑色
  };

  // === キーボードショートカットの実装 ===
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // 回答済みまたはクイズ終了時は無効
      if (hasAnswered || isQuizComplete) return;

      // 1〜4のキーが押された場合
      const keyNumber = parseInt(event.key);
      if (keyNumber >= 1 && keyNumber <= 4) {
        handleAnswerClick(keyNumber - 1);
      }
    };

    // イベントリスナーを登録
    document.addEventListener("keydown", handleKeyPress);

    // クリーンアップ関数（コンポーネントがアンマウントされる時に実行）
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [hasAnswered, isQuizComplete, handleAnswerClick]);

  // === 新しい問題開始時にタイマーを開始 ===
  useEffect(() => {
    // クイズ終了または回答済みの場合はタイマーを開始しない
    if (isQuizComplete || hasAnswered) {
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
      return;
    }

    // 新しいタイマーを開始
    const newTimerId = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 100) {
          // 時間切れの処理
          handleTimeUp();
          return 0;
        }
        return prev - 1000; // 1000ms間隔で1000ms減らす
      });
    }, 1000); // 1000ms間隔で更新

    setTimerId(newTimerId);

    // クリーンアップ
    return () => {
      clearInterval(newTimerId);
    };
  }, [currentQuestionIndex, hasAnswered, isQuizComplete, handleTimeUp]);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [timerId]);

  // === 結果画面 ===
  if (isQuizComplete) {
    return (
      <TerminalLayout cli="--complete">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-green-400">
            QUIZ COMPLETE!
          </h2>
          <p className="text-lg text-white">
            Score: {score} / {questions.length}
          </p>
          <p className="mt-2 text-gray-400">
            正答率: {Math.round((score / questions.length) * 100)}%
          </p>
        </div>
      </TerminalLayout>
    );
  }

  return (
    <TerminalLayout cli={`--question ${currentQuestionIndex + 1}`}>
      {/* 進捗とスコア表示 */}
      <div className="my-4">
        {/* スコアとプログレスバー表示 */}
        <div className="flex items-center justify-between gap-2">
          {getTerminalProgressBar()}
          <span className="font-mono text-sm text-white">Score: {score}</span>
        </div>
      </div>

      {/* コード表示エリア */}
      <div className="mb-8 rounded-lg border border-[#333] bg-gray-900 p-4">
        <pre className="overflow-x-auto text-sm text-gray-300">
          <code>{currentQuestion?.code}</code>
        </pre>
      </div>

      <div className="mb-4 flex items-center">
        <span className="mr-2 text-green-400" aria-label="出力">
          &gt;
        </span>
        <span className="text-white">
          {hasAnswered
            ? selectedAnswer === -1
              ? "Time up! Processing..."
              : "Processing..."
            : "Select your answer:"}
        </span>
      </div>

      {/* 選択肢ボタン */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {currentQuestion?.choices.map((choice, index) => (
          <div key={index} className={getButtonStyle(index)}>
            <Button
              context="game"
              onClick={() => handleAnswerClick(index)}
              label={choice}
              shortcutKey={index + 1}
            />
          </div>
        ))}
      </div>
    </TerminalLayout>
  );
}

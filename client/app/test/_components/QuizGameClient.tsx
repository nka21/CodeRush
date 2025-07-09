"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TerminalLayout } from "@/components/TerminalLayout";
import { useQuizGame } from "@/hooks/useQuizGame";
import { QuizTimerSection } from "./QuizTimerSection";
import { CodeDisplay } from "./CodeDisplay";
import { AnswerChoice } from "./AnswerChoice";
import { QuizResultScreen } from "./QuizResult";
import type { Question, QuizResult } from "../_types/quiz";

type QuizGameClientProps = {
  questions: Question[];
};

export const QuizGameClient = (props: QuizGameClientProps) => {
  const { questions } = props;

  const router = useRouter();
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const handleQuizComplete = useCallback((result: QuizResult) => {
    setQuizResult(result);
  }, []);

  const handleTypingComplete = useCallback(() => {
    setIsTypingComplete(true);
  }, []);

  const {
    currentQuestion,
    currentQuestionIndex,
    score,
    isComplete,
    hasAnswered,
    answerState,
    submitAnswer,
    handleTimeExpired,
    getAnswerChoiceStatus,
  } = useQuizGame({ questions, onComplete: handleQuizComplete });

  // 問題が変わったらタイピング状態をリセット
  useEffect(() => {
    setIsTypingComplete(false);
  }, [currentQuestionIndex]);

  const commandText = `--question ${currentQuestionIndex + 1}`;

  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (hasAnswered || isComplete) return;

      const keyNumber = parseInt(event.key);
      if (keyNumber >= 1 && keyNumber <= 4) {
        submitAnswer(keyNumber - 1);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [hasAnswered, isComplete, submitAnswer]);

  // 結果画面
  if (quizResult) {
    return (
      <TerminalLayout cli="--complete" onTypingComplete={() => {}}>
        <QuizResultScreen result={quizResult} />
        <button
          onClick={() => router.push("/")}
          className="mt-6 rounded-lg bg-green-500 px-6 py-3 text-white hover:bg-green-600"
        >
          ホームに戻る
        </button>
      </TerminalLayout>
    );
  }

  // クイズプレイ画面
  return (
    <TerminalLayout cli={commandText} onTypingComplete={handleTypingComplete}>
      <QuizTimerSection
        onTimeExpired={handleTimeExpired}
        isRunning={isTypingComplete && !hasAnswered && !isComplete}
        currentQuestionIndex={currentQuestionIndex}
        score={score}
      />

      {currentQuestion && (
        <>
          <CodeDisplay code={currentQuestion.code} />

          <div className="mb-4 flex items-center">
            <span className="mr-2 text-green-400" aria-label="出力">
              &gt;
            </span>
            <span className="text-white">
              {hasAnswered
                ? answerState.type === "time_expired"
                  ? "Time up! Processing..."
                  : "Processing..."
                : "Select your answer:"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {currentQuestion.choices.map((choice, index) => (
              <AnswerChoice
                key={index}
                choice={choice}
                index={index}
                status={getAnswerChoiceStatus(index)}
                onSelect={submitAnswer}
              />
            ))}
          </div>
        </>
      )}
    </TerminalLayout>
  );
};

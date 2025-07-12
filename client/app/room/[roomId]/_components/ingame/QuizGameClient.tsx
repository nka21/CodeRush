"use client";

import { useCallback, useEffect, useState } from "react";
import { TerminalLayout } from "@/components/TerminalLayout";
import { QuizTimerSection } from "./QuizTimerSection";
import { CodeDisplay } from "./CodeDisplay";
import { AnswerChoice } from "./AnswerChoice";
import { QuizResultScreen } from "./QuizResult";
import { QuestionLog } from "../QuestionLog";
import { Button } from "@/components/Button";
import type { Question, QuizResult, AnswerState } from "../../_types/quiz";
import { ANIMATION } from "../../_constants/quiz";

type QuizGameClientProps = {
  questions: Question[];
  onGameEnd?: () => void;
  roomId?: string;
};

// ゲーム状態を詳細に管理
type GamePhase = "playing" | "result" | "question_log";

export const QuizGameClient = (props: QuizGameClientProps) => {
  const { questions, onGameEnd, roomId } = props;

  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [gamePhase, setGamePhase] = useState<GamePhase>("playing");

  // Quiz game state (previously in useQuizGame)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>({
    type: "unanswered",
  });

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const isComplete = currentQuestionIndex >= questions.length;
  const hasAnswered = answerState.type !== "unanswered";

  const handleQuizComplete = useCallback((result: QuizResult) => {
    setQuizResult(result);
    setGamePhase("result");
  }, []);

  // QuestionLogに移行する関数
  const handleShowQuestionLog = useCallback(() => {
    setGamePhase("question_log");
  }, []);

  const handleTypingComplete = useCallback(() => {
    setIsTypingComplete(true);
  }, []);

  const checkAnswer = useCallback(
    (selectedIndex: number): boolean => {
      if (!currentQuestion) return false;
      return selectedIndex === currentQuestion.correctAnswer;
    },
    [currentQuestion],
  );

  const moveToNextQuestion = useCallback(() => {
    // ゲーム終了状態の場合は何もしない
    if (gamePhase !== "playing") {
      return;
    }

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= questions.length) {
      // クイズ完了
      const result: QuizResult = {
        score,
        totalQuestions: questions.length,
        accuracyPercentage: Math.round((score / questions.length) * 100),
      };
      handleQuizComplete(result);
    } else {
      setCurrentQuestionIndex(nextIndex);
      setAnswerState({ type: "unanswered" });
    }
  }, [
    currentQuestionIndex,
    questions.length,
    score,
    handleQuizComplete,
    gamePhase,
  ]);

  const submitAnswer = useCallback(
    (selectedIndex: number) => {
      if (hasAnswered || !currentQuestion || gamePhase !== "playing") return;

      setAnswerState({ type: "answered", selectedIndex });

      if (checkAnswer(selectedIndex)) {
        setScore((prev) => prev + 1);
      }

      // 次の問題へ自動遷移
      setTimeout(() => {
        moveToNextQuestion();
      }, ANIMATION.ANSWER_REVEAL_DELAY_MS);
    },
    [hasAnswered, currentQuestion, checkAnswer, moveToNextQuestion, gamePhase],
  );

  const handleTimeExpired = useCallback(() => {
    if (hasAnswered || gamePhase !== "playing") return;

    setAnswerState({ type: "time_expired" });

    setTimeout(() => {
      moveToNextQuestion();
    }, ANIMATION.ANSWER_REVEAL_DELAY_MS);
  }, [hasAnswered, moveToNextQuestion, gamePhase]);

  const getAnswerChoiceStatus = useCallback(
    (choiceIndex: number) => {
      if (!hasAnswered || !currentQuestion) return "default";

      const isCorrect = choiceIndex === currentQuestion.correctAnswer;

      if (answerState.type === "time_expired") {
        return isCorrect ? "correct" : "disabled";
      }

      if (answerState.type === "answered") {
        if (isCorrect) return "correct";
        if (choiceIndex === answerState.selectedIndex) return "incorrect";
        return "disabled";
      }

      return "default";
    },
    [answerState, currentQuestion, hasAnswered],
  );

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

  // QuestionLogからロビーに戻る
  const handleReturnToLobby = useCallback(() => {
    if (onGameEnd) {
      onGameEnd();
    }
  }, [onGameEnd]);

  // 結果画面
  if (gamePhase === "result" && quizResult) {
    return (
      <TerminalLayout cli="--complete" onTypingComplete={() => {}}>
        <QuizResultScreen
          result={quizResult}
          onShowQuestionLog={handleShowQuestionLog}
          onReturnToLobby={handleReturnToLobby}
        />
      </TerminalLayout>
    );
  }

  // QuestionLog画面
  if (gamePhase === "question_log") {
    return (
      <TerminalLayout cli="--question.log" onTypingComplete={() => {}}>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          <QuestionLog />
          <div className="my-5 flex gap-3">
            <Button
              onClick={handleReturnToLobby}
              shortcutKey={1}
              label="cd ~/ && ./room"
              description="// 待機画面に戻る"
            />
            <Button
              onClick={handleReturnToLobby}
              shortcutKey={2}
              label="cd ~/ && ./home"
              description="// ホームに戻る"
            />
          </div>
        </div>
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
                : "Choose correct output:"}
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

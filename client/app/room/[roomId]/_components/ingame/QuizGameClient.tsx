"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TerminalLayout } from "@/components/TerminalLayout";
import { QuizTimerSection } from "./QuizTimerSection";
import { CodeDisplay } from "./CodeDisplay";
import { AnswerChoice } from "./AnswerChoice";
import { QuizResultScreen } from "./QuizResult";
import { QuestionLog } from "../QuestionLog";
import { Button } from "@/components/Button";
import { useWebSocket } from "@/hooks/useWebSocket";
import type {
  Question,
  QuizResult,
  AnswerState,
  WebSocketQuestion,
} from "../../_types/quiz";
import type { ClientMessage, ServerMessage } from "@/app/_types/api";
import { ANIMATION } from "../../_constants/quiz";

type QuizGameClientProps = {
  // questions: Question[]; // mockデータは不要
  onGameEnd?: () => void;
  roomId?: string;
  userId?: string; // userIdを追加
  questionMessage?: any; // 初回の問題メッセージ
};

// ゲーム状態を詳細に管理
type GamePhase = "playing" | "result" | "question_log";

export const QuizGameClient = (props: QuizGameClientProps) => {
  const { onGameEnd, roomId, userId, questionMessage } = props;
  const router = useRouter();

  // WebSocket接続
  const { isConnected, sendMessage, lastMessage, connect, disconnect } =
    useWebSocket();

  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [gamePhase, setGamePhase] = useState<GamePhase>("playing");

  // WebSocketから受信した現在の問題
  const [currentQuestion, setCurrentQuestion] =
    useState<WebSocketQuestion | null>(null);

  // サーバーから送信される正解（answer_resultメッセージから取得）
  const [correctAnswer, setCorrectAnswer] = useState<string>("");

  // Quiz game state (previously in useQuizGame)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0); // 初期値は0のまま、サーバーから更新される
  const [answerState, setAnswerState] = useState<AnswerState>({
    type: "unanswered",
  });

  // 問題数を動的に管理（初期値は不明なので大きな値にしておく）
  const [totalQuestions, setTotalQuestions] = useState<number>(999);
  const isComplete = currentQuestionIndex >= totalQuestions;
  const hasAnswered = answerState.type !== "unanswered";

  // 初期化時にRoomClientから渡された問題メッセージを処理
  useEffect(() => {
    if (questionMessage && questionMessage.type === "question_start") {
      console.log("🎬 初期問題メッセージを処理:", questionMessage.payload);
      const questionData: WebSocketQuestion = {
        questionNumber: questionMessage.payload.questionNumber,
        question: questionMessage.payload.question,
        choices: questionMessage.payload.choices,
      };
      console.log("📋 初期問題データを設定:", questionData);
      setCurrentQuestion(questionData);
      setCurrentQuestionIndex(questionMessage.payload.questionNumber - 1);
      setAnswerState({ type: "unanswered" });
      setCorrectAnswer(""); // 正解をリセット
    }
  }, [questionMessage?.payload?.questionNumber]);

  // WebSocket接続を開始
  useEffect(() => {
    if (roomId && userId) {
      connect(roomId, userId);
    }
    return () => {
      disconnect();
    };
  }, [roomId, userId, connect, disconnect]);

  const handleQuizComplete = useCallback(
    (result: QuizResult) => {
      console.log("🎯 handleQuizComplete実行:", result);
      console.log("📈 現在のgamePhase:", gamePhase);
      setQuizResult(result);
      setGamePhase("result");
      console.log("✅ gamePhaseを'result'に変更完了");
    },
    [gamePhase],
  );

  // サーバーからのメッセージを処理
  useEffect(() => {
    if (!lastMessage) return;

    console.log("🎮 QuizGameClient - メッセージ受信:", lastMessage);
    const message = lastMessage as ServerMessage;

    switch (message.type) {
      case "user_joined":
        console.log("👤 User joined:", message.payload.userId);
        break;
      case "question_start":
        console.log("❓ Question started:", message.payload);
        // サーバーから次の問題が送られてきた場合の遷移処理
        if (gamePhase === "playing") {
          const questionData: WebSocketQuestion = {
            questionNumber: message.payload.questionNumber,
            question: message.payload.question,
            choices: message.payload.choices,
          };
          console.log("📋 問題データを設定:", questionData);
          setCurrentQuestion(questionData);
          setCurrentQuestionIndex(message.payload.questionNumber - 1);
          setAnswerState({ type: "unanswered" });
          setIsTypingComplete(false);
          setCorrectAnswer(""); // 正解をリセット
        }
        break;
      case "answer_result":
        console.log("✅ Answer result:", message.payload);
        const {
          userId: answeredUserId,
          isCorrect,
          correctAnswer,
          scores,
        } = message.payload;

        // 回答者が自分でない場合は、先に回答されたとして処理
        if (answeredUserId !== userId && gamePhase === "playing" && userId) {
          console.log("🏃 他の人が先に回答:", answeredUserId);
          // 正解の選択肢インデックスを見つける
          const correctIndex =
            currentQuestion?.choices.findIndex(
              (choice) => choice === correctAnswer,
            ) ?? -1;

          if (correctIndex !== -1) {
            setAnswerState({
              type: "answered_by_other",
              correctIndex,
              answeredBy: answeredUserId,
            });
          }
        }

        // 正解を保存（answer_resultで送られてくる）
        setCorrectAnswer(correctAnswer);

        // スコアを更新（全員のスコアがサーバーから送られてくる）
        if (scores && userId && typeof scores[userId] === "number") {
          console.log(`💯 スコア更新: ${score} → ${scores[userId]}`);
          setScore(scores[userId]);
        } else {
          console.log("⚠️ スコア更新失敗:", {
            scores,
            userId,
            userScore: userId ? scores?.[userId] : undefined,
          });
        }
        break;
      case "game_over":
        console.log("🏁 Game over:", message.payload);
        console.log("🔍 game_over詳細分析:", {
          messageType: message.type,
          payload: message.payload,
          userId: userId,
          gamePhase: gamePhase,
          currentQuestionIndex: currentQuestionIndex,
        });

        // 実際の問題数を設定（最後の問題番号から推定）
        const actualTotalQuestions = currentQuestionIndex + 1;
        console.log("📊 実際の問題数:", actualTotalQuestions);
        setTotalQuestions(actualTotalQuestions);

        // サーバーから送られてくる最終結果データを使用
        const gameOverData = message.payload as {
          roomId: string;
          players: Record<
            string,
            { name: string; score: number; rank: number }
          >;
        };
        console.log("📊 gameOverData構造:", gameOverData);

        // playersが存在するかチェック
        if (!gameOverData.players) {
          console.error(
            "❌ gameOverDataにplayersが存在しません:",
            gameOverData,
          );
          // フォールバック：現在のスコアを使用
          const result: QuizResult = {
            score,
            totalQuestions: actualTotalQuestions,
            accuracyPercentage: Math.round(
              (score / (actualTotalQuestions * 10)) * 100,
            ),
          };
          console.log(
            "🏆 結果画面データ（フォールバック - playersなし）:",
            result,
          );
          handleQuizComplete(result);
          break;
        }

        const myResult = gameOverData.players[userId || ""];
        console.log("👤 自分の結果:", { userId, myResult });

        if (myResult) {
          const result: QuizResult = {
            score: myResult.score,
            totalQuestions: actualTotalQuestions,
            accuracyPercentage: Math.round(
              (myResult.score / (actualTotalQuestions * 10)) * 100,
            ), // 10点/問題
          };
          console.log("🏆 結果画面データ:", result);
          console.log("🎬 handleQuizComplete呼び出し前");
          handleQuizComplete(result);
          console.log("🎬 handleQuizComplete呼び出し後");
        } else {
          // フォールバック：現在のスコアを使用
          const result: QuizResult = {
            score,
            totalQuestions: actualTotalQuestions,
            accuracyPercentage: Math.round(
              (score / (actualTotalQuestions * 10)) * 100,
            ),
          };
          console.log("🏆 結果画面データ（フォールバック）:", result);
          console.log("🎬 handleQuizComplete呼び出し前（フォールバック）");
          handleQuizComplete(result);
          console.log("🎬 handleQuizComplete呼び出し後（フォールバック）");
        }
        break;
    }
  }, [
    lastMessage?.type,
    lastMessage?.type === "question_start"
      ? (lastMessage as any)?.payload?.questionNumber
      : null,
    gamePhase,
    userId,
    handleQuizComplete,
  ]);

  // QuestionLogに移行する関数
  const handleShowQuestionLog = useCallback(() => {
    setGamePhase("question_log");
  }, []);

  const handleTypingComplete = useCallback(() => {
    setIsTypingComplete(true);
  }, []);

  // WebSocketベースではサーバー側で正解判定されるため、checkAnswer関数は不要
  // const checkAnswer = useCallback(
  //   (selectedIndex: number): boolean => {
  //     if (!currentQuestion) return false;
  //     return selectedIndex === currentQuestion.correctAnswer;
  //   },
  //   [currentQuestion],
  // );

  const moveToNextQuestion = useCallback(() => {
    // ゲーム終了状態の場合は何もしない
    if (gamePhase !== "playing") {
      return;
    }

    const nextIndex = currentQuestionIndex + 1;

    // 通常はサーバーからgame_overメッセージが来るので、ここではゲーム完了処理をしない
    // 万が一の場合のフォールバック
    if (totalQuestions !== 999 && nextIndex >= totalQuestions) {
      console.log(
        "⚠️ クライアント側でゲーム完了を検出（通常はサーバーから通知される）",
      );
      const result: QuizResult = {
        score,
        totalQuestions: totalQuestions,
        accuracyPercentage: Math.round((score / (totalQuestions * 10)) * 100),
      };
      handleQuizComplete(result);
    } else {
      setCurrentQuestionIndex(nextIndex);
      setAnswerState({ type: "unanswered" });
    }
  }, [
    currentQuestionIndex,
    totalQuestions,
    score,
    handleQuizComplete,
    gamePhase,
  ]);

  const submitAnswer = useCallback(
    (selectedIndex: number) => {
      if (hasAnswered || !currentQuestion || gamePhase !== "playing") return;

      console.log("🎯 回答を送信:", {
        selectedIndex,
        selectedChoice: currentQuestion.choices[selectedIndex],
        allChoices: currentQuestion.choices,
        questionNumber: currentQuestion.questionNumber,
      });

      setAnswerState({ type: "answered", selectedIndex });

      // WebSocketでサーバーに回答を送信
      if (isConnected && currentQuestion) {
        const message: ClientMessage = {
          type: "answer",
          payload: {
            answer: currentQuestion.choices[selectedIndex],
          },
        };
        console.log("📤 WebSocketメッセージ送信:", message);
        sendMessage(message);
      }

      // サーバーからの応答を待つため、ローカルでのスコア更新や自動遷移は行わない
      // answer_resultメッセージでスコアとゲーム状態が更新される
    },
    [hasAnswered, currentQuestion, gamePhase, isConnected, sendMessage],
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

      // 正解の選択肢インデックスを見つける
      const correctIndex = currentQuestion.choices.findIndex(
        (choice) => choice === correctAnswer,
      );
      const isCorrect = choiceIndex === correctIndex;

      if (answerState.type === "time_expired") {
        return isCorrect ? "correct" : "disabled";
      }

      if (answerState.type === "answered") {
        if (isCorrect) return "correct";
        if (choiceIndex === answerState.selectedIndex) return "incorrect";
        return "disabled";
      }

      if (answerState.type === "answered_by_other") {
        if (choiceIndex === answerState.correctIndex) return "correct";
        return "disabled";
      }

      return "default";
    },
    [answerState, currentQuestion, hasAnswered, correctAnswer],
  );

  // 問題が変わったらタイピング状態をリセット
  useEffect(() => {
    setIsTypingComplete(false);
  }, [currentQuestionIndex]);

  // デバッグ用：currentQuestionの状態をログ出力
  useEffect(() => {
    console.log("🎯 現在の問題状態:", {
      currentQuestion,
      currentQuestionIndex,
      gamePhase,
      hasCurrentQuestion: !!currentQuestion,
    });
  }, [currentQuestion, currentQuestionIndex, gamePhase]);

  // デバッグ用：gamePhaseとquizResultの状態を監視
  useEffect(() => {
    console.log("🎮 ゲーム状態変更:", {
      gamePhase,
      quizResult,
      hasQuizResult: !!quizResult,
    });
  }, [gamePhase, quizResult]);

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

  // ホームに戻る
  const handleReturnToHome = useCallback(() => {
    router.push("/");
  }, [router]);

  // 結果画面
  if (gamePhase === "result" && quizResult) {
    console.log("🎊 結果画面をレンダリング:", { gamePhase, quizResult });
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
    console.log("📋 QuestionLog画面をレンダリング");
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
              onClick={handleReturnToHome}
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
  console.log("🎮 クイズプレイ画面をレンダリング:", {
    gamePhase,
    currentQuestion: !!currentQuestion,
  });
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
          {/* CodeDisplayで問題文を表示 */}
          <CodeDisplay
            question={currentQuestion.question}
            questionNumber={currentQuestion.questionNumber}
          />

          <div className="mb-4 flex items-center">
            <span className="mr-2 text-green-400" aria-label="出力">
              &gt;
            </span>
            <span className="text-white">
              {hasAnswered
                ? answerState.type === "time_expired"
                  ? "Time up! Processing..."
                  : answerState.type === "answered_by_other"
                    ? `${answerState.answeredBy} answered first! Processing...`
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

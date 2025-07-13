export type DifficultyLevel = "easy" | "medium" | "hard";

// WebSocketで送られてくる問題データの型
export type WebSocketQuestion = {
  questionNumber: number;
  question: string; // Statement
  choices: string[];
};

// クライアント側で使用する問題データの型（既存）
export type Question = {
  id: number;
  difficulty: DifficultyLevel;
  code: string;
  choices: string[];
  correctAnswer: number;
};

export type AnswerState =
  | { type: "unanswered" }
  | { type: "answered"; selectedIndex: number }
  | { type: "time_expired" }
  | { type: "answered_by_other"; correctIndex: number; answeredBy: string }; // 誰が回答したかを追加

export type QuizState = {
  currentQuestionIndex: number;
  score: number;
  answerState: AnswerState;
  timeRemaining: number; // ミリ秒
};

export type QuizResult = {
  score: number;
  totalQuestions: number;
  accuracyPercentage: number;
};

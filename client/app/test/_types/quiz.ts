export type DifficultyLevel = "easy" | "medium" | "hard";

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
  | { type: "time_expired" };

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

type Difficulty = "easy" | "medium" | "hard";

export type Question = {
  id: number;
  difficulty: Difficulty;
  code: string;
  choices: string[];
  correctAnswer: number;
};

export const TIME_LIMIT = 30;

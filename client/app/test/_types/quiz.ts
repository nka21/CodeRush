type Difficulty = "easy" | "medium" | "hard";

export type Question = {
  id: number;
  difficulty: Difficulty;
  code: string;
  choices: string[];
  correctAnswer: number;
};

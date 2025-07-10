import { QuizGameClient } from "./_components/QuizGameClient";
import mockData from "./_data/mock.json";
import type { Question } from "./_types/quiz";

export default function QuizGamePage() {
  const questions: Question[] = mockData as Question[];

  return <QuizGameClient questions={questions} />;
}

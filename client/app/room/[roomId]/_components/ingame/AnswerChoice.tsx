import React, { memo } from "react";
import { Button } from "@/components/Button";
import { STYLE_CLASSES } from "../../_constants/quiz";

type AnswerChoiceProps = {
  choice: string;
  index: number;
  status: "default" | "correct" | "incorrect" | "disabled";
  onSelect: (index: number) => void;
};

export const AnswerChoice = memo((props: AnswerChoiceProps) => {
  const { choice, index, status, onSelect } = props;

  const getStatusClassName = () => {
    switch (status) {
      case "correct":
        return STYLE_CLASSES.CORRECT_ANSWER;
      case "incorrect":
        return STYLE_CLASSES.INCORRECT_ANSWER;
      case "disabled":
        return STYLE_CLASSES.DISABLED_CHOICE;
      default:
        return "";
    }
  };

  return (
    <div className={getStatusClassName()}>
      <Button
        context="game"
        onClick={() => onSelect(index)}
        label={choice}
        shortcutKey={index + 1}
      />
    </div>
  );
});

AnswerChoice.displayName = "AnswerChoice";

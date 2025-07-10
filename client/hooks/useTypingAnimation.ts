import { useState, useEffect } from "react";

type UseTypingAnimationProps = {
  text: string;
  baseSpeed: number;
  delayAfterCompletion: number;
};

export const useTypingAnimation = (props: UseTypingAnimationProps) => {
  const { text, baseSpeed, delayAfterCompletion } = props;

  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setIsComplete(false);
      return;
    }

    let index = 0;
    let timeoutId: NodeJS.Timeout;
    let completionTimeoutId: NodeJS.Timeout;
    setDisplayedText("");
    setIsComplete(false);

    const typeNextChar = () => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;

        // ランダム間隔
        const randomDelay = baseSpeed + Math.random() * 100;
        timeoutId = setTimeout(typeNextChar, randomDelay);
      } else {
        // タイピング完了後に遅延
        if (delayAfterCompletion > 0) {
          completionTimeoutId = setTimeout(() => {
            setIsComplete(true);
          }, delayAfterCompletion);
        } else {
          setIsComplete(true);
        }
      }
    };

    typeNextChar();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (completionTimeoutId) {
        clearTimeout(completionTimeoutId);
      }
    };
  }, [text]);

  return { displayedText, isComplete };
};

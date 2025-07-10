import { useState, useEffect } from "react";

type UseTypingAnimationProps = {
  text: string;
  baseSpeed: number;
};

export const useTypingAnimation = (props: UseTypingAnimationProps) => {
  const { text, baseSpeed } = props;

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
        setIsComplete(true);
      }
    };

    typeNextChar();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [text]);

  return { displayedText, isComplete };
};

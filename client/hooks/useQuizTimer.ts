import { useCallback, useEffect, useRef, useState } from "react";
import { TIMER } from "@/app/room/[roomId]/_constants/quiz";

type UseQuizTimerProps = {
  onTimeExpired: () => void;
  isRunning: boolean;
};

export const useQuizTimer = ({
  onTimeExpired,
  isRunning,
}: UseQuizTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(TIMER.DURATION_MS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasExpiredRef = useRef(false);

  const resetTimer = useCallback(() => {
    setTimeRemaining(TIMER.DURATION_MS);
    hasExpiredRef.current = false;
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) {
      stopTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - TIMER.UPDATE_INTERVAL_MS;

        if (newTime <= 0 && !hasExpiredRef.current) {
          hasExpiredRef.current = true;
          onTimeExpired();
          return 0;
        }

        return Math.max(0, newTime);
      });
    }, TIMER.UPDATE_INTERVAL_MS);

    return stopTimer;
  }, [isRunning, onTimeExpired, stopTimer]);

  const progress = timeRemaining / TIMER.DURATION_MS;
  const remainingSeconds = Math.ceil(timeRemaining / 1000);

  return {
    timeRemaining,
    remainingSeconds,
    progress,
    resetTimer,
    stopTimer,
  };
};

import { memo } from "react";
import { TIMER } from "../../_constants/quiz";

type TimerProgressBarProps = {
  progress: number; // 0〜1の範囲
};

export const TimerProgressBar = memo((props: TimerProgressBarProps) => {
  const { progress } = props;

  const totalBars = TIMER.DURATION_SECONDS;
  const filledBars = Math.floor(progress * totalBars);

  // 時間に応じて色を決定
  const getColorClass = () => {
    if (progress <= TIMER.CRITICAL_THRESHOLD) return "text-red-400";
    if (progress <= TIMER.WARNING_THRESHOLD) return "text-yellow-400";
    return "text-green-400";
  };

  const colorClass = getColorClass();

  return (
    <div
      className="flex flex-1 overflow-hidden font-mono"
      role="progressbar"
      aria-valuenow={filledBars}
      aria-valuemin={0}
      aria-valuemax={totalBars}
    >
      {Array.from({ length: totalBars }, (_, index) => {
        const isFilled = index < filledBars;
        return (
          <span
            key={index}
            className={`flex-1 ${colorClass} text-xs`}
            aria-hidden="true"
          >
            {isFilled ? "▓" : "░"}
          </span>
        );
      })}
    </div>
  );
});

TimerProgressBar.displayName = "TimerProgressBar";

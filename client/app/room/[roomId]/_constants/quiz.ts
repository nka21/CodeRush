// クイズのタイマー関連
export const TIMER = {
  DURATION_SECONDS: 30,
  DURATION_MS: 30 * 1000,
  UPDATE_INTERVAL_MS: 1000,
  CRITICAL_THRESHOLD: 0.3, // 30%以下で赤色
  WARNING_THRESHOLD: 0.6, // 60%以下で黄色
} as const;

// アニメーション関連
export const ANIMATION = {
  ANSWER_REVEAL_DELAY_MS: 2000, // 回答後、次の問題に進むまでの遅延
  TYPING_BASE_SPEED_MS: 80,
} as const;

// 回答状態
export const ANSWER_STATE = {
  TIME_EXPIRED: -1, // 時間切れを表す特殊な値
} as const;

// スタイルクラス
export const STYLE_CLASSES = {
  CORRECT_ANSWER: "animate-pulse border-green-500 bg-green-500/20",
  INCORRECT_ANSWER: "animate-shake border-red-500 bg-red-500/20",
  DISABLED_CHOICE: "opacity-50",
} as const;

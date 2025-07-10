import { memo } from "react";

type ButtonContext = "home" | "game";

type Props = {
  context: ButtonContext;
  onClick: () => void;
  label: string;
  description?: string;
  shortcutKey?: number;
};

export const Button = memo((props: Props) => {
  const { shortcutKey, label, description, onClick, context } = props;

  const baseClasses =
    "group relative flex w-full cursor-pointer items-center overflow-hidden rounded-lg border border-[rgba(0,255,136,0.2)] bg-white/[0.02] p-5 transition-all duration-300 hover:translate-x-[10px] hover:border-[rgba(0,255,136,0.5)] hover:bg-[rgba(0,255,136,0.05)] hover:shadow-[0_0_30px_rgba(0,255,136,0.3),inset_0_0_20px_rgba(0,255,136,0.1)]";
  const contextClasses =
    context === "home"
      ? "menu-item opacity-0"
      : "animate-in slide-in-from-left-5 duration-500 fill-mode-forwards";

  return (
    <button
      type="button"
      className={`${baseClasses} ${contextClasses}`}
      onClick={onClick}
      aria-label={description || label}
    >
      {shortcutKey && (
        <kbd className="mr-4 font-bold text-[#ff00ff] [text-shadow:0_0_10px_rgba(255,0,255,0.5)]">
          [{shortcutKey}]
        </kbd>
      )}
      <div className="flex flex-col items-start">
        <span className="text-lg text-white">{label}</span>
        <p className="mt-1 text-sm text-gray-400">{description}</p>
      </div>
      {context === "home" && (
        <span
          className="menu-arrow ml-auto transition-all duration-300 group-hover:translate-x-[5px] group-hover:text-[#00ff88]"
          aria-hidden="true"
        >
          →
        </span>
      )}
    </button>
  );
});

Button.displayName = "Button";

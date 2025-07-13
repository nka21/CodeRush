import { memo, useRef, useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type CodeDisplayProps = {
  code?: string;
  question?: string;
  questionNumber?: number;
};

export const CodeDisplay = memo((props: CodeDisplayProps) => {
  const { code, question, questionNumber } = props;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  // 表示するコンテンツを決定
  const displayContent = question || code || "";
  const isQuestion = !!question;

  // スクロール可能かどうかをチェックする関数
  const checkScrollable = () => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = scrollRef.current;
      const isScrollable = scrollHeight > clientHeight;
      const isNotAtBottom = scrollTop < scrollHeight - clientHeight - 5; // 5pxの余裕
      setShowBottomShadow(isScrollable && isNotAtBottom);
    }
  };

  useEffect(() => {
    checkScrollable();
    const scrollElement = scrollRef.current;

    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScrollable);
      // リサイズ時にもチェック
      window.addEventListener("resize", checkScrollable);

      return () => {
        scrollElement.removeEventListener("scroll", checkScrollable);
        window.removeEventListener("resize", checkScrollable);
      };
    }
  }, [displayContent]);

  return (
    <div className="relative mb-8">
      <div
        ref={scrollRef}
        className="scrollbar-thin scrollbar-thumb-gray-500/50 scrollbar-track-transparent hover:scrollbar-thumb-gray-400/70 max-h-[calc(90vh-510px)] overflow-y-auto rounded-lg border border-[#333] bg-[#1E1E1E]"
      >
        <SyntaxHighlighter
          language="c"
          style={vscDarkPlus}
          className="overflow-x-auto"
        >
          {displayContent}
        </SyntaxHighlighter>
      </div>

      {/* 下部のシャドー：スクロール可能な場合のみ表示 */}
      {showBottomShadow && (
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-8 rounded-b-lg bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent" />
      )}

      <style jsx>
        {`
          div::-webkit-scrollbar {
            width: 6px;
          }
          div::-webkit-scrollbar-track {
            background: transparent;
          }
          div::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.3);
            border-radius: 3px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.5);
          }
        `}
      </style>
    </div>
  );
});

CodeDisplay.displayName = "CodeDisplay";

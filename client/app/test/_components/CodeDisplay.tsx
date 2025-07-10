import { memo } from "react";

type CodeDisplayProps = {
  code: string;
};

export const CodeDisplay = memo((props: CodeDisplayProps) => {
  const { code } = props;

  return (
    <div className="scrollbar-thin scrollbar-thumb-gray-500/50 scrollbar-track-transparent hover:scrollbar-thumb-gray-400/70 mb-8 max-h-[calc(90vh-510px)] overflow-y-auto rounded-lg border border-[#333] bg-gray-900 p-4">
      <pre className="overflow-x-auto text-sm text-gray-300">
        <code>{code}</code>
      </pre>
    </div>
  );
});

CodeDisplay.displayName = "CodeDisplay";

import { memo } from "react";

type CodeDisplayProps = {
  code: string;
};

export const CodeDisplay = memo((props: CodeDisplayProps) => {
  const { code } = props;

  return (
    <div className="mb-8 rounded-lg border border-[#333] bg-gray-900 p-4">
      <pre className="overflow-x-auto text-sm text-gray-300">
        <code>{code}</code>
      </pre>
    </div>
  );
});

CodeDisplay.displayName = "CodeDisplay";

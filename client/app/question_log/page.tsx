"use client";

import { TerminalLayout } from "@/components/TerminalLayout";
import { QuestionLog } from "./QuestionLog";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";

export default function QuestionLogPage() {
  const router = useRouter();

  return (
    <TerminalLayout cli="--question.log">
      <div className="max-h-[60vh] space-y-4 overflow-y-auto">
        <QuestionLog />
        <div className="my-5 flex gap-3">
          <Button
            onClick={() => router.push("/room/42")}
            shortcutKey={1}
            label="cd ~/ && ./room"
            description="// 待機画面に戻る"
          />
          <Button
            onClick={() => router.push("/")}
            shortcutKey={2}
            label="cd ~/ && ./home"
            description="// ホームに戻る"
          />
        </div>
      </div>
    </TerminalLayout>
  );
}

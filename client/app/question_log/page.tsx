"use client";

import { TerminalLayout } from "@/components/TerminalLayout";
import { QuestionLog } from "./QuestionLog";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";

export default function QuestionLogPage() {
  const router = useRouter();

  return (
    <TerminalLayout cli="--question.log">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">

        <QuestionLog />
      <div className="my-5 flex gap-3">
        <Button
          onClick={() => router.push(`/room/${roomid}`)}
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

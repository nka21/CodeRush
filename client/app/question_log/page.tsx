"use client"

import { TerminalLayout } from "@/components/TerminalLayout";
import { QuestionLog } from "./QuestionLog";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";


export default function QuestionLogPage() {
  const router = useRouter();
  
  return (
      <TerminalLayout cli="--question.log">
        <div className="glitch my-4">
          <h1 className="font-sixtyfour typing-text text-4xl font-bold text-green-400 md:text-5xl">
            CODE RUSH
          </h1>
        </div>

        <QuestionLog />

      <Button onClick={() => router.push(`/room/${roomid}`)} shortcutKey={1} label="cd ~/ && ./room" description="// 待機画面に戻る"/>
      </TerminalLayout>
  );
}

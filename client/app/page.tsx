"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TerminalLayout } from "@/components/TerminalLayout";
import { Button } from "@/components/Button";

export default function Home() {
  const router = useRouter();

  const handleDisplayMakeModal = useCallback(() => {
    console.log("> Starting test mode...");
    router.push("/test");
  }, []);

  /**
   * 対戦モードへ遷移（未実装）
   */
  const handleDisplayJoinModal = useCallback(() => {
    console.log("> Starting battle mode...");
    // TODO: 対戦モード実装時に適切なルートへ遷移
    alert("対戦モードは準備中です");
  }, []);

  /**
   * キーボードショートカット（1キー：テストモード、2キー：対戦モード）
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "1") handleDisplayMakeModal();
      if (event.key === "2") handleDisplayJoinModal();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <TerminalLayout cli="--init">
      <div className="glitch my-4">
        <h1 className="font-sixtyfour typing-text text-4xl font-bold text-green-400 md:text-5xl">
          CODE RUSH
        </h1>
      </div>

      <div className="mb-2 flex items-center">
        <span className="mr-2 text-green-400" aria-label="出力">
          &gt;
        </span>
        <span className="text-white">
          Real-time collaborative coding platform ready.
        </span>
      </div>

      <nav className="mt-8 flex flex-col gap-4" role="menu">
        <Button
          context="home"
          onClick={handleDisplayMakeModal}
          label="MAKE_ROOM"
          description="ゲームルームを作成する"
          shortcutKey={1}
        />
        <Button
          context="home"
          onClick={handleDisplayJoinModal}
          label="JOIN_ROOM"
          description="既存の部屋に参加する"
          shortcutKey={2}
        />
      </nav>
    </TerminalLayout>
  );
}

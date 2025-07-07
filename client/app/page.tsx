"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TerminalLayout } from "@/components/TerminalLayout";
import { Button } from "@/components/Button";

export default function Home() {
  const router = useRouter();

  /**
   * 部屋作成モーダルを表示
   */
  const handleMakeRoom = useCallback(() => {
    console.log("> Making new room...");
    // TODO: 部屋作成モーダルを表示
  }, []);

  /**
   * 部屋参加モーダルを表示
   */
  const handleJoinRoom = useCallback(() => {
    console.log("> Joining existing room...");
    // TODO: 部屋参加モーダルを表示
  }, []);

  /**
   * キーボードショートカット（1キー：部屋作成、2キー：部屋参加）
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "1") handleMakeRoom();
      if (event.key === "2") handleJoinRoom();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleMakeRoom, handleJoinRoom]);

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
          onClick={() => router.push("/test")}
          label="MAKE_ROOM"
          description="ゲームルームを作成する"
          shortcutKey={1}
        />
        <Button
          context="home"
          onClick={handleJoinRoom}
          label="JOIN_ROOM"
          description="既存の部屋に参加する"
          shortcutKey={2}
        />
      </nav>
    </TerminalLayout>
  );
}

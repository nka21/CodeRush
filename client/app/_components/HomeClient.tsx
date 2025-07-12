"use client";

import { useCallback, useEffect } from "react";
import { Button } from "@/components/Button";
import { useCreateRoom } from "@/hooks/api/useCreateRoom";
import { useJoinRoom } from "@/hooks/api/useJoinRoom";

export const HomeClient = () => {
  const { createRoomAndNavigate } = useCreateRoom();
  const { joinRoomAndNavigate } = useJoinRoom();

  const handleDisplayMakeModal = useCallback(async () => {
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();

    await createRoomAndNavigate({
      roomId,
      settings: {
        difficulty: "Normal",
        language: "Python",
      },
    });
  }, []);

  const handleDisplayJoinModal = useCallback(async () => {
    const roomId = prompt("参加するルームIDを入力してください:");

    if (!roomId) {
      alert("ルームIDが入力されませんでした");
      return;
    }

    await joinRoomAndNavigate(roomId, {
      playerName: "user_438e985574fe71edwdwdwdw",
    });
  }, []);

  /**
   * キーボードショートカット
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "1") handleDisplayMakeModal();
      if (event.key === "2") handleDisplayJoinModal();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleDisplayMakeModal, handleDisplayJoinModal]);

  return (
    <>
      <div className="mb-2 flex items-center">
        <span className="mr-2 text-green-400" aria-label="出力">
          &gt;
        </span>
        <span className="text-white">早押しコードリーディング対決</span>
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
          description="ゲームルームに参加する"
          shortcutKey={2}
        />
      </nav>
    </>
  );
};

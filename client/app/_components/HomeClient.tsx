"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { JoinModal } from "@/components/JoinModal";
import { useCreateRoom } from "@/hooks/api/useCreateRoom";

export const HomeClient = () => {
  const { createRoomAndNavigate } = useCreateRoom();

  const [showJoinModal, setShowJoinModal] = useState(false);

  // userIdを生成・管理
  const [userId] = useState(() => {
    return `user_${Math.random().toString(36).substr(2, 9)}`;
  });

  const handleDisplayMakeModal = useCallback(async () => {
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();

    console.log(`ルーム作成: roomId=${roomId}, hostId=${userId}`);

    // userIdをlocalStorageに保存してRoomClientで使用
    localStorage.setItem("currentUserId", userId);
    console.log(
      "localStorageに保存したuserId:",
      localStorage.getItem("currentUserId"),
    );

    try {
      const result = await createRoomAndNavigate({
        roomId,
        hostId: userId, // hostIdを追加
        settings: {
          difficulty: "Normal",
          language: "Python",
        },
      });
      console.log("ルーム作成結果:", result);
    } catch (error) {
      console.error("ルーム作成エラー:", error);
    }
  }, [createRoomAndNavigate, userId]);

  const handleDisplayJoinModal = useCallback(() => {
    setShowJoinModal(true);
  }, []);

  const handleCloseJoinModal = useCallback(() => {
    setShowJoinModal(false);
  }, []);

  /**
   * キーボードショートカット
   * モーダルが開いている時は無効化
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // モーダルが開いている時はショートカットキーを無効化
      if (showJoinModal) return;

      if (event.key === "1") handleDisplayMakeModal();
      if (event.key === "2") handleDisplayJoinModal();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleDisplayMakeModal, handleDisplayJoinModal, showJoinModal]);

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

      <JoinModal isOpen={showJoinModal} onClose={handleCloseJoinModal} />
    </>
  );
};

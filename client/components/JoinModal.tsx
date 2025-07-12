"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { Modal } from "./Modal";
import { useJoinRoom } from "@/hooks/api/useJoinRoom";

type JoinModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const JoinModal = memo((props: JoinModalProps) => {
  const { isOpen, onClose } = props;
  const { joinRoomAndNavigate } = useJoinRoom();

  const [roomId, setRoomId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * モーダルが閉じられたときに入力値をリセット
   */
  const handleClose = useCallback(() => {
    setRoomId("");
    setErrorMessage("");
    setIsLoading(false);
    onClose();
  }, [onClose]);

  /**
   * ルーム参加処理
   */
  const handleJoinRoom = useCallback(async () => {
    if (!roomId.trim()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await joinRoomAndNavigate(roomId.trim(), {
        playerName: "user_438e985574fe71edwdwdwdw",
      });
      handleClose();
    } catch (error) {
      console.error("ルーム参加エラー:", error);
      setErrorMessage("ルームに参加できませんでした。");
    } finally {
      setIsLoading(false);
    }
  }, [roomId, joinRoomAndNavigate, handleClose]);

  /**
   * Enterキーでルーム参加
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && roomId.trim() && !isLoading) {
        handleJoinRoom();
      }
    },
    [handleJoinRoom, roomId, isLoading],
  );

  /**
   * 入力値変更時にエラーメッセージをクリア
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRoomId(e.target.value);
      if (errorMessage) {
        setErrorMessage("");
      }
    },
    [errorMessage],
  );

  /**
   * モーダルが開かれたときに入力フィールドにフォーカス
   */
  useEffect(() => {
    if (isOpen) {
      // 少し遅延させてフォーカスを設定
      setTimeout(() => {
        const input = document.getElementById("roomId");
        if (input) {
          input.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // 参加ボタンの有効/無効を判定
  const isJoinButtonDisabled = !roomId.trim() || isLoading;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="w-full max-w-md rounded-lg border border-green-400/20 bg-black/90 p-6">
        <h2 className="font-cascadia mb-4 text-xl text-white">JOIN_ROOM</h2>

        <div className="mb-4">
          <label
            htmlFor="roomId"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            ルームID
          </label>
          <input
            id="roomId"
            type="text"
            value={roomId}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full rounded-md border border-green-400/30 bg-black/50 px-3 py-2 text-white focus:border-green-400/50 focus:ring-2 focus:ring-green-400/50 focus:outline-none"
            placeholder="ルームIDを入力してください"
            disabled={isLoading}
          />

          {/* エラーメッセージ */}
          {errorMessage && (
            <div className="mt-2 rounded-md border border-red-400/30 bg-red-500/10 p-3">
              <div className="flex items-center">
                <svg
                  className="mr-2 h-4 w-4 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-red-400">{errorMessage}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleJoinRoom}
            disabled={isJoinButtonDisabled}
            className={`flex-1 rounded-md border px-4 py-2 transition-colors ${
              isJoinButtonDisabled
                ? "cursor-not-allowed border-gray-600/30 bg-gray-600/10 text-gray-600"
                : "cursor-pointer border-green-400/30 bg-green-500/20 text-green-400 hover:border-green-400/50 hover:bg-green-500/30"
            }`}
          >
            {isLoading ? "参加中..." : "参加"}
          </button>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 cursor-pointer rounded-md border border-gray-400/30 bg-gray-500/20 px-4 py-2 text-gray-400 transition-colors hover:border-gray-400/50 hover:bg-gray-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            キャンセル
          </button>
        </div>
      </div>
    </Modal>
  );
});

JoinModal.displayName = "JoinModal";

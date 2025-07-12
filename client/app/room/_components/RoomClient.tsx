"use client";

import { TerminalLayout } from "@/components/TerminalLayout";
import { Button } from "@/components/Button";
import { memo } from "react";
import { useRouter } from "next/navigation";

type Player = {
  id: string;
  name: string;
  isOnline: boolean;
  isReady: boolean;
  isHost: boolean;
};

type RoomClientProps = {
  roomId: string;
};

/**
 * プレイヤーカードコンポーネント
 * 各プレイヤーの情報（名前、オンライン状態、準備状況）を表示
 */
const PlayerCard = memo((props: { player: Player }) => {
  const { player } = props;

  return (
    <div className="flex min-h-[60px] items-center gap-3 rounded-md border border-green-400/20 bg-green-500/5 p-3">
      {/* オンライン状態インジケーター */}
      <div
        className={`h-2 w-2 rounded-full ${
          player.isOnline ? "animate-pulse bg-green-500" : "bg-gray-500"
        }`}
        aria-label={player.isOnline ? "オンライン" : "オフライン"}
      />

      {/* プレイヤー情報 */}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-white">{player.name}</div>
          {player.isHost && (
            <span className="rounded-sm border border-orange-500/30 bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">
              HOST
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

/**
 * 空きスロットコンポーネント
 * プレイヤーが参加していないスロットを表示
 */
const EmptySlot = memo(() => {
  return (
    <div className="flex min-h-[60px] items-center justify-center rounded-md border border-dashed border-gray-600/30 bg-gray-800/20 p-3">
      <span className="text-xs text-gray-500" />
    </div>
  );
});

export const RoomClient = memo((props: RoomClientProps) => {
  const { roomId } = props;
  const router = useRouter();

  // モックデータ（実際のAPIから取得する予定）
  const mockPlayers: Player[] = [
    {
      id: "1",
      name: "CodeMaster",
      isOnline: true,
      isReady: true,
      isHost: true,
    },
    {
      id: "2",
      name: "DevNinja",
      isOnline: true,
      isReady: false,
      isHost: false,
    },
    {
      id: "3",
      name: "BugHunter",
      isOnline: false,
      isReady: false,
      isHost: false,
    },
  ];

  // 最大4人まで表示するため、空きスロットを計算
  const maxPlayers = 4;
  const emptySlots = Math.max(0, maxPlayers - mockPlayers.length);

  return (
    <TerminalLayout
      cli={`--room ${roomId}`}
      roomId={roomId}
      currentParticipants={mockPlayers.length}
      maxParticipants={maxPlayers}
      onTypingComplete={() => {}}
    >
      {/* プレイヤーリストセクション */}
      <div className="mt-4 mb-12">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-green-400">&gt;</span>
          <span className="text-white">
            Players ({mockPlayers.length}/{maxPlayers})
          </span>
        </div>

        {/* プレイヤーグリッド */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {/* 既存のプレイヤーを表示 */}
          {mockPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}

          {/* 空きスロットを表示 */}
          {Array.from({ length: emptySlots }, (_, index) => (
            <EmptySlot key={`empty-${index}`} />
          ))}
        </div>
      </div>

      {/* コントロールボタン */}
      <div className="flex gap-4">
        <Button
          label="RETURN_HOME"
          description="ホームに戻る"
          onClick={() => router.push("/")}
          context="room"
          shortcutKey={1}
        />
        <Button
          label="START_GAME"
          description="ゲームを開始する"
          onClick={() => router.push("/test")}
          context="room"
          shortcutKey={2}
        />
      </div>
    </TerminalLayout>
  );
});

PlayerCard.displayName = "PlayerCard";
EmptySlot.displayName = "EmptySlot";

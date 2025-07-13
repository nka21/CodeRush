"use client";

import { TerminalLayout } from "@/components/TerminalLayout";
import { Button } from "@/components/Button";
import { memo, useState, useCallback, useEffect } from "react";
import { QuizGameClient } from "../[roomId]/_components/ingame/QuizGameClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { ServerMessage } from "@/app/_types/api";

type Player = {
  id: string;
  name: string;
  isHost: boolean;
};

type GameState = "lobby" | "ingame";

type RoomClientProps = {
  roomId: string;
};

type RoomData = {
  players: Record<string, { name: string }>;
  hostId: string;
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
      <div className={"h-2 w-2 animate-pulse rounded-full bg-green-500"} />

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
  const [gameState, setGameState] = useState<GameState>("lobby");
  const [players, setPlayers] = useState<Player[]>([]);
  const [hostId, setHostId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false); // 参加済みフラグ
  const [isStartingGame, setIsStartingGame] = useState(false); // ゲーム開始中フラグ

  // 最後に受信したquestion_startメッセージを保持
  const [lastQuestionMessage, setLastQuestionMessage] = useState<
    ServerMessage | undefined
  >(undefined);

  // userIdを生成・管理（クライアントサイドでのみ実行）
  const [userId, setUserId] = useState<string>("");

  // WebSocket接続
  const { isConnected, lastMessage, connect, connectionStatus } =
    useWebSocket();

  // ルーム情報を取得する関数
  const fetchRoomInfo = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/room/${roomId}`);

      if (response.ok) {
        const roomData: RoomData = await response.json();

        // プレイヤーリストを変換
        const playersList = Object.entries(roomData.players || {}).map(
          ([id, player]) => ({
            id,
            name: player.name,
            isHost: id === roomData.hostId,
          }),
        );

        setPlayers(playersList);
        setHostId(roomData.hostId);
        setIsLoading(false);

        // 現在のユーザーが既に参加済みかどうかを確認
        const isCurrentUserInRoom = playersList.some(
          (player) => player.id === userId,
        );

        if (isCurrentUserInRoom) {
          setHasJoined(true);
        }
      } else {
        console.error("ルーム情報の取得に失敗:", response.status);
      }
    } catch (error) {
      console.error("ルーム情報取得エラー:", error);
    }
  }, [roomId, userId]);

  // ゲーム開始処理
  const handleGameStart = useCallback(async () => {
    if (isStartingGame) return;

    setIsStartingGame(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/quiz/start/${roomId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hostId: userId,
          }),
        },
      );

      if (response.ok) {
        await response.json();
      } else {
        console.error("ゲーム開始API失敗:", response.status);
      }
    } catch (error) {
      console.error("ゲーム開始APIエラー:", error);
    } finally {
      setIsStartingGame(false);
    }
  }, [roomId, userId, isStartingGame]);

  const handleReturnToLobby = useCallback(() => {
    setGameState("lobby");
  }, []);

  // クライアントサイドでuserIdを初期化
  useEffect(() => {
    // ブラウザ環境でのみ実行
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("currentUserId");
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        const newUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("currentUserId", newUserId);
        setUserId(newUserId);
      }
    }
  }, []); // 初回のみ実行

  // ルーム情報の初期取得
  useEffect(() => {
    if (userId) {
      fetchRoomInfo();
    }
  }, [fetchRoomInfo, userId]);

  // WebSocket接続の管理
  useEffect(() => {
    if (userId && roomId) {
      connect(roomId, userId);
    }
  }, [connect, roomId, userId]);

  // WebSocketメッセージの処理
  useEffect(() => {
    if (lastMessage) {
      // ゲーム状態に応じてメッセージ処理を分岐
      if (gameState === "lobby") {
        // ロビー状態でのみ処理
        switch (lastMessage.type) {
          case "user_joined":
            // ユーザーリストを更新
            fetchRoomInfo();
            break;
          case "question_start":
            setGameState("ingame");
            // 新しい問題のみを保持（同じ問題番号の問題は更新しない）
            setLastQuestionMessage((prev) => {
              if (
                prev?.type === "question_start" &&
                lastMessage.type === "question_start" &&
                prev.payload.questionNumber ===
                  lastMessage.payload.questionNumber
              ) {
                return prev;
              }
              return lastMessage;
            });
            break;
        }
      }
    }
  }, [lastMessage, gameState, fetchRoomInfo]);

  // 自動参加チェック
  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (players.length === 0) {
      return;
    }

    if (hasJoined) {
      return;
    }

    if (!userId) {
      return;
    }

    const joinRoom = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/room/${roomId}/join`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userId,
              playerName: `Player_${userId.slice(-6)}`,
            }),
          },
        );

        if (response.ok) {
          await response.json();
          setHasJoined(true);
          fetchRoomInfo();
        } else {
          console.error("ルーム参加失敗:", response.status);
        }
      } catch (error) {
        console.error("ルーム参加エラー:", error);
      }
    };

    joinRoom();
  }, [isLoading, players, userId, roomId, hasJoined, fetchRoomInfo]);

  // userIdが初期化されるまで待機
  if (!userId) {
    return (
      <TerminalLayout cli="--loading" onTypingComplete={() => {}}>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center">
            <span className="text-white">Initializing user session...</span>
          </div>
        </div>
      </TerminalLayout>
    );
  }

  // ルーム情報を取得する関数
  // WebSocket接続を確立
  // 初期ルーム情報の取得
  // ユーザーがルームに参加していない場合は参加する
  // WebSocket接続状態とメッセージを監視
  // WebSocketメッセージの処理
  // ゲーム開始ハンドラー
  // ロビーに戻るハンドラー
  // 現在のユーザーがホストかどうかを判定
  const isHost = userId === hostId;

  // プレイヤー数に応じて最大値を設定（最低4人、実際のプレイヤー数まで対応）
  const maxPlayers = Math.max(4, players.length);
  const emptySlots = maxPlayers - players.length;

  // ロード中の表示
  if (isLoading) {
    return (
      <TerminalLayout cli="--loading" onTypingComplete={() => {}}>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center">
            <span className="text-white">Loading room info...</span>
            {/* WebSocket接続状態を表示 */}
            <div className="mt-2 text-sm">
              <span
                className={`mr-2 inline-block h-2 w-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "connecting"
                      ? "animate-pulse bg-yellow-500"
                      : connectionStatus === "error"
                        ? "bg-red-500"
                        : "bg-gray-500"
                }`}
              ></span>
              <span className="text-gray-300">
                WebSocket:{" "}
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "connecting"
                    ? "Connecting..."
                    : connectionStatus === "error"
                      ? "Connection Error"
                      : "Disconnected"}
              </span>
            </div>
            {connectionStatus === "error" && (
              <div className="mt-2 text-xs text-red-400">
                サーバーに接続できません。サーバーが起動しているか確認してください。
              </div>
            )}
          </div>
        </div>
      </TerminalLayout>
    );
  }

  // ゲーム中の場合、QuizGameClientを表示
  if (gameState === "ingame") {
    return (
      <QuizGameClient
        onGameEnd={handleReturnToLobby}
        roomId={roomId}
        userId={userId}
        questionMessage={lastQuestionMessage} // question_startメッセージをQuizGameClientに渡す
      />
    );
  }

  // ロビー画面
  return (
    <TerminalLayout
      cli={`--room ${roomId}`}
      roomId={roomId}
      currentParticipants={players.length}
      maxParticipants={maxPlayers}
      onTypingComplete={() => {}}
    >
      {/* プレイヤーリストセクション */}
      <div className="mt-4 mb-12">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-green-400">&gt;</span>
          <span className="text-white">
            Players ({players.length}/{maxPlayers})
          </span>
          {/* WebSocket接続状態を表示 */}
          <span
            className={`ml-2 text-sm ${isConnected ? "text-green-400" : "text-red-400"}`}
          >
            {isConnected ? "[Connected]" : "[Disconnected]"}
          </span>
        </div>

        {/* プレイヤーグリッド */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {/* 既存のプレイヤーを表示 */}
          {players.map((player) => (
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
          label="JOIN_ROOM"
          description="// 現在のルームに参加する"
          onClick={isLoading ? () => {} : () => fetchRoomInfo()}
          shortcutKey={1}
        />
        {isHost && (
          <Button
            label={isStartingGame ? "STARTING..." : "START_GAME"}
            description="// ゲームを開始する"
            onClick={isStartingGame ? () => {} : handleGameStart}
            shortcutKey={2}
          />
        )}
      </div>
    </TerminalLayout>
  );
});

PlayerCard.displayName = "PlayerCard";
EmptySlot.displayName = "EmptySlot";
RoomClient.displayName = "RoomClient";

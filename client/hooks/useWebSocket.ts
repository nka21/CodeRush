import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientMessage, ServerMessage } from "@/app/_types/api";

type UseWebSocketReturn = {
  isConnected: boolean;
  sendMessage: (message: ClientMessage) => void;
  lastMessage: ServerMessage | null;
  connect: (roomId: string, userId: string) => void;
  disconnect: () => void;
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
};

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);

  // サーバーが起動しているかチェック
  const checkServerHealth = useCallback(async (): Promise<boolean> => {
    try {
      console.log("🏥 サーバーヘルスチェック開始...");

      // タイムアウト制御
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // 既存のAPIエンドポイントを使用してサーバーの生存確認
      const response = await fetch("http://localhost:8080/api/room", {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 200番台か404でもサーバーが動作していることを示す
      if (response.status < 500) {
        console.log("✅ サーバーは正常に動作しています");
        return true;
      } else {
        console.log("⚠️ サーバーエラー:", response.status);
        return false;
      }
    } catch (error: any) {
      console.error("❌ サーバーヘルスチェック失敗:", error);

      // ネットワークエラーの詳細分析
      if (error.name === "AbortError") {
        console.error("⏰ 接続タイムアウト（5秒）");
      } else if (error.message?.includes("fetch")) {
        console.error("🌐 ネットワーク接続に失敗");
      }

      console.error("💡 確認事項:");
      console.error(
        "  1. サーバーが起動しているか（go run cmd/route/main.go）",
      );
      console.error("  2. ポート8080が使用可能か");
      console.error("  3. CORSが正しく設定されているか");
      console.error("  4. ファイアウォールの設定");
      return false;
    }
  }, []);

  const connect = useCallback(
    async (roomId: string, userId: string) => {
      // 既存の接続がある場合は切断
      if (wsRef.current) {
        wsRef.current.close();
      }

      // 再接続タイマーをクリア
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // サーバーヘルスチェック
      setConnectionStatus("connecting");
      const isServerHealthy = await checkServerHealth();

      if (!isServerHealthy) {
        console.error(
          "❌ サーバーヘルスチェックに失敗。WebSocket接続をスキップ",
        );
        setConnectionStatus("error");
        return;
      }

      const wsUrl = `ws://localhost:8080/api/quiz/ws/${roomId}?userId=${userId}`;
      console.log("🔗 WebSocket接続を開始:", { wsUrl, roomId, userId });

      try {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log("✅ WebSocket connected successfully");
          setIsConnected(true);
          setConnectionStatus("connected");
          reconnectAttempts.current = 0; // 成功時は再接続回数をリセット
        };

        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as ServerMessage;
            console.log("📨 Received message:", message);
            setLastMessage(message);
          } catch (error) {
            console.error(
              "❌ Failed to parse WebSocket message:",
              error,
              "Raw data:",
              event.data,
            );
          }
        };

        wsRef.current.onclose = (event) => {
          console.log("🔌 WebSocket disconnected", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
          setIsConnected(false);
          setConnectionStatus("disconnected");

          // 予期しない切断の場合は再接続を試行
          if (
            !event.wasClean &&
            reconnectAttempts.current < maxReconnectAttempts
          ) {
            const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 指数バックオフ
            console.log(
              `🔄 ${delay}ms後に再接続を試行... (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`,
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++;
              connect(roomId, userId);
            }, delay);
          } else if (reconnectAttempts.current >= maxReconnectAttempts) {
            console.error("❌ 最大再接続回数に達しました");
            setConnectionStatus("error");
          }
        };

        wsRef.current.onerror = (event) => {
          console.error("❌ WebSocket error occurred:", {
            type: event.type,
            readyState: wsRef.current?.readyState,
            url: wsUrl,
            timestamp: new Date().toISOString(),
          });
          setIsConnected(false);
          setConnectionStatus("error");

          // より詳細なエラー情報
          if (wsRef.current) {
            const readyStateText =
              {
                0: "CONNECTING",
                1: "OPEN",
                2: "CLOSING",
                3: "CLOSED",
              }[wsRef.current.readyState] || "UNKNOWN";

            console.error("WebSocket状態詳細:", {
              readyState: wsRef.current.readyState,
              readyStateText,
              url: wsRef.current.url,
            });
          }

          console.error("💡 WebSocketエラーの考えられる原因:");
          console.error(
            "  1. サーバーのWebSocketエンドポイントが起動していない",
          );
          console.error("  2. URLパスが間違っている (/api/quiz/ws/{roomId})");
          console.error(
            "  3. ファイアウォールでWebSocket接続がブロックされている",
          );
        };
      } catch (error) {
        console.error("❌ Failed to create WebSocket connection:", error);
        setConnectionStatus("error");
      }
    },
    [checkServerHealth],
  );

  const disconnect = useCallback(() => {
    console.log("🔌 手動でWebSocket切断");

    // 再接続タイマーをクリア
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect"); // 正常終了
      wsRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus("disconnected");
    reconnectAttempts.current = 0;
  }, []);

  const sendMessage = useCallback(
    (message: ClientMessage) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const messageStr = JSON.stringify(message);
        console.log("📤 Sending message:", message);
        wsRef.current.send(messageStr);
      } else {
        console.error("❌ WebSocket is not connected. Current state:", {
          readyState: wsRef.current?.readyState,
          isConnected,
          connectionStatus,
        });
      }
    },
    [isConnected, connectionStatus],
  );

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    sendMessage,
    lastMessage,
    connect,
    disconnect,
    connectionStatus,
  };
};

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  JoinRoomRequestSchema,
  JoinRoomResponseSchema,
  type JoinRoomRequest,
  type JoinRoomResponse,
} from "@/app/_types/api";

export const useJoinRoom = () => {
  const router = useRouter();

  const joinRoom = useCallback(
    async (roomId: string, playerData: JoinRoomRequest) => {
      try {
        const validatedBody = JoinRoomRequestSchema.parse(playerData);

        const response = await fetch(
          `http://localhost:8080/api/room/${roomId}/join`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(validatedBody),
          },
        );

        if (!response.ok) {
          throw new Error(`ルームへの参加に失敗しました: ${response.status}`);
        }

        // レスポンスを型安全に処理
        const responseData = await response.json();
        const validatedResponse: JoinRoomResponse =
          JoinRoomResponseSchema.parse(responseData);

        if (!validatedResponse.success) {
          throw new Error(
            validatedResponse.message || "ルームへの参加に失敗しました",
          );
        }

        return validatedResponse;
      } catch (error) {
        console.error("Error joining room:", error);
        throw error;
      }
    },
    [],
  );

  const joinRoomAndNavigate = useCallback(
    async (roomId: string, playerData: JoinRoomRequest) => {
      try {
        await joinRoom(roomId, playerData);
        router.push(`/room/${roomId}`);
      } catch (error) {
        alert("ルームへの参加に失敗しました");
      }
    },
    [],
  );

  return {
    joinRoom,
    joinRoomAndNavigate,
  };
};

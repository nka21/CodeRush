import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  JoinRoomRequestSchema,
  RoomSchema,
  type JoinRoomRequest,
  type JoinRoomResponse,
} from "@/app/_types/api";
import { apiPost } from "@/app/_utils/api";

export const useJoinRoom = () => {
  const router = useRouter();

  const joinRoom = useCallback(
    async (roomId: string, playerData: JoinRoomRequest) => {
      // リクエストデータのバリデーション
      const validatedBody = JoinRoomRequestSchema.parse(playerData);

      // 共通API関数を使用
      return apiPost<JoinRoomResponse>(
        `/room/${roomId}/join`,
        validatedBody,
        RoomSchema,
      );
    },
    [],
  );

  const joinRoomAndNavigate = useCallback(
    async (roomId: string, playerData: JoinRoomRequest) => {
      try {
        const room = await joinRoom(roomId, playerData);

        // Roomオブジェクトが返されたら成功
        router.push(`/room/${room.roomId}`);
      } catch (error) {
        console.error("Error joining room:", error);
        throw error; // エラーを再スローして、呼び出し元で処理できるようにする
      }
    },
    [joinRoom, router],
  );

  return {
    joinRoom,
    joinRoomAndNavigate,
  };
};

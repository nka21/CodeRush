import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CreateRoomRequestSchema,
  RoomSchema,
  type CreateRoomRequest,
  type CreateRoomResponse,
} from "@/app/_types/api";
import { apiPost } from "@/app/_utils/api";

export const useCreateRoom = () => {
  const router = useRouter();

  const createRoom = useCallback(async (roomData: CreateRoomRequest) => {
    // リクエストデータのバリデーション
    const validatedBody = CreateRoomRequestSchema.parse(roomData);

    // 共通API関数を使用
    return apiPost<CreateRoomResponse>("/room", validatedBody, RoomSchema);
  }, []);

  const createRoomAndNavigate = useCallback(
    async (roomData: CreateRoomRequest) => {
      try {
        const room = await createRoom(roomData);

        // Roomオブジェクトが返されたら成功
        router.push(`/room/${room.roomId}`);
      } catch (error) {
        console.error("Error creating room:", error);
        alert("ルームの作成に失敗しました");
      }
    },
    [createRoom, router],
  );

  return {
    createRoom,
    createRoomAndNavigate,
  };
};

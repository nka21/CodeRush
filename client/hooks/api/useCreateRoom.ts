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
    console.log("CreateRoom APIリクエスト:", roomData);

    // リクエストデータのバリデーション
    const validatedBody = CreateRoomRequestSchema.parse(roomData);
    console.log("バリデーション後のリクエスト:", validatedBody);

    // 共通API関数を使用
    const response = await apiPost<CreateRoomResponse>(
      "/room",
      validatedBody,
      RoomSchema,
    );
    console.log("CreateRoom APIレスポンス:", response);

    return response;
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

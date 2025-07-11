import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CreateRoomRequestSchema,
  CreateRoomResponseSchema,
  type CreateRoomRequest,
  type CreateRoomResponse,
} from "@/app/_types/api";

export const useCreateRoom = () => {
  const router = useRouter();

  const createRoom = useCallback(async (roomData: CreateRoomRequest) => {
    try {
      const validatedBody = CreateRoomRequestSchema.parse(roomData);

      const response = await fetch(`http://localhost:8080/api/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedBody),
      });

      if (!response.ok) {
        throw new Error(`ルームの作成に失敗しました: ${response.status}`);
      }

      // レスポンスを型安全に処理
      const responseData = await response.json();
      const validatedResponse: CreateRoomResponse =
        CreateRoomResponseSchema.parse(responseData);

      if (!validatedResponse.success) {
        throw new Error(
          validatedResponse.message || "ルームの作成に失敗しました",
        );
      }

      return validatedResponse;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }, []);

  const createRoomAndNavigate = useCallback(
    async (roomData: CreateRoomRequest) => {
      try {
        await createRoom(roomData);
        router.push(`/room/${roomData.roomId}`);
      } catch (error) {
        alert("ルームの作成に失敗しました");
      }
    },
    [],
  );

  return {
    createRoom,
    createRoomAndNavigate,
  };
};

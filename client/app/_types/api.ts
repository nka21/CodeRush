import { z } from "zod";

// === ルーム作成 ===
export const CreateRoomRequestSchema = z.object({
  roomId: z.string(),
  settings: z.object({
    difficulty: z.enum(["Easy", "Normal", "Hard"]),
    language: z.enum(["Python", "JavaScript", "TypeScript", "Go", "Java"]),
  }),
});

export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;

export const CreateRoomResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z
    .object({
      roomId: z.string(),
      settings: z.object({
        difficulty: z.string(),
        language: z.string(),
      }),
    })
    .optional(),
});

export type CreateRoomResponse = z.infer<typeof CreateRoomResponseSchema>;

// === ルーム参加 ===
export const JoinRoomRequestSchema = z.object({
  playerName: z.string(),
});

export type JoinRoomRequest = z.infer<typeof JoinRoomRequestSchema>;

export const JoinRoomResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z
    .object({
      roomId: z.string(),
      playerName: z.string(),
    })
    .optional(),
});

export type JoinRoomResponse = z.infer<typeof JoinRoomResponseSchema>;

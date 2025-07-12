import { z } from "zod";

// ゲーム設定のスキーマ
export const SettingsSchema = z.object({
  difficulty: z.enum(["Easy", "Normal", "Hard"]),
  language: z.enum([
    "C",
    "Python",
    "JavaScript",
    "Java",
    "Ruby",
    "Go",
    "TypeScript",
    "Random",
  ]),
});

export type Settings = z.infer<typeof SettingsSchema>;

// プレイヤーのスキーマ
export const PlayerSchema = z.object({
  name: z.string(),
  score: z.number(),
  isReady: z.boolean(),
});

export type Player = z.infer<typeof PlayerSchema>;

// ルーム全体のスキーマ
export const RoomSchema = z.object({
  roomId: z.string(),
  hostId: z.string(),
  settings: SettingsSchema,
  players: z.record(z.string(), PlayerSchema),
  gameState: z.string(),
  createdAt: z.string(),
});

export type Room = z.infer<typeof RoomSchema>;

// ルーム作成のリクエストボディ
export const CreateRoomRequestSchema = z.object({
  roomId: z.string().optional(),
  settings: SettingsSchema,
});

export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;

// ルーム参加のリクエストボディ
export const JoinRoomRequestSchema = z.object({
  playerName: z.string(),
});

export type JoinRoomRequest = z.infer<typeof JoinRoomRequestSchema>;

// レスポンス型は直接Roomオブジェクト
export type CreateRoomResponse = Room;
export type JoinRoomResponse = Room;

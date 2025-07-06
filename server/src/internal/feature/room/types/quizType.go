// backend/src/internal/feature/quiz/types/types.go
// APIで利用するデータ構造を定義します。
package types

import "time"

// Settings はゲームルームの設定
type Settings struct {
	Difficulty string `json:"difficulty"`
	Language   string `json:"language"`
}

// Player はゲーム参加者
type Player struct {
	Name    string `json:"name"`
	Score   int    `json:"score"`
	IsReady bool   `json:"isReady"`
}

// Room は個々のゲームルームの全情報
type Room struct {
	RoomID    string            `json:"roomId"`
	HostID    string            `json:"hostId"`
	Settings  Settings          `json:"settings"`
	Players   map[string]Player `json:"players"`
	GameState string            `json:"gameState"`
	CreatedAt time.Time         `json:"createdAt"`
}

// --- リクエスト/レスポンス用の構造体 ---

// RoomCreationRequest はルーム作成時のリクエストボディ
type RoomCreationRequest struct {
	RoomID   string   `json:"roomId"`
	Settings Settings `json:"settings"`
}

// JoinRequest はルーム参加時のリクエストボディ
type JoinRequest struct {
	PlayerName string `json:"playerName"`
}

// ErrorResponse はエラー時の共通レスポンス
type ErrorResponse struct {
	Message string `json:"message"`
}

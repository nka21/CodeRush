// backend/src/internal/feature/quiz/types/types.go
// APIで利用するデータ構造を定義します。
package types

import "time"

// Settings はゲームルームの設定

type Settings struct {
	Difficulty string `json:"difficulty" dynamodbav:"difficulty"`
	Language   string `json:"language" dynamodbav:"language"`
}

type Player struct {
	Name    string `json:"name" dynamodbav:"name"`
	Score   int    `json:"score" dynamodbav:"score"`
	IsReady bool   `json:"isReady" dynamodbav:"is_ready"`
}


// Room は個々のゲームルームの全情報
type Room struct {
	RoomID    string            `json:"roomId" dynamodbav:"room_id"`
	HostID    string            `json:"hostId" dynamodbav:"host_id"`
	Settings  Settings          `json:"settings" dynamodbav:"settings"`
	Players   map[string]Player `json:"players" dynamodbav:"players"`
	GameState string            `json:"gameState" dynamodbav:"game_state"`
	CreatedAt time.Time         `json:"createdAt" dynamodbav:"created_at"`
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

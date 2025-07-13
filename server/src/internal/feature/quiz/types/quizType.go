// server/src/internal/feature/quiz/types/types.go
package types

// Message はクライアントとサーバー間でやり取りされるJSONメッセージの共通構造体です。
type Message struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload,omitempty"`
	// RoomID はJSONには含めず、ハブ内部でのルーティングに使用します。
	RoomID  string      `json:"-"`
}

// Question は1つのクイズ問題を表す構造体です。
type Question struct {
	ID        string   `json:"id"`
	Statement string   `json:"statement"` // 問題文
	Choices   []string `json:"choices"`   // 選択肢
	Answer    string   `json:"-"`         // 答え（クライアントには送信しない）
}

// GameState は一つのルームにおける現在のゲーム状態を保持します。
type GameState struct {
	CurrentQuestion  *Question
	Scores           map[string]int  // Key: UserID, Value: Score
	AnsweredUsers    map[string]bool // この問題に回答済みのユーザー
	QuestionNumber   int             // 現在が何問目か
	IsQuestionActive bool            // 現在の問題が回答可能か
	UsedQuestionIDs  []string        // 出題済み問題ID
}

// PlayerResult は最終結果のランキング表示に使用する構造体です。
type PlayerResult struct {
	UserID   string `json:"userId"`
	// Name     string `json:"name"` // 必要であればユーザー名も追加
	Score    int    `json:"score"`
	Rank     int    `json:"rank"`
}

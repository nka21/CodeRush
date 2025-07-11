// server/src/internal/feature/quiz/types/message.go
package types

// Message はクライアントとサーバー間でやり取りされるJSONメッセージの構造体です。
type Message struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload,omitempty"`

	// RoomID はJSONには含めず、ハブ内部でのルーティングに使用します。
	// そのため、jsonタグは付けていません。
	RoomID  string
}

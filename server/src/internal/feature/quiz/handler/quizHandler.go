// server/src/internal/feature/quiz/handler/quizHandler.go
package handler

import (
	"log"
	"net/http"
	"server/src/internal/feature/quiz/websocket"

	// gorilla/websocketパッケージに "ws" という別名を付けます
	ws "github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

// 別名を付けた "ws" を使ってUpgraderを定義します
var upgrader = ws.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // 開発中はすべてのオリジンを許可
	},
}

// QuizHandler はWebSocket接続の受付を担当します。
// ここで使う 'websocket' は、自作した "server/src/internal/feature/quiz/websocket" パッケージを指します。
type QuizHandler struct {
	hub *websocket.RoomHub
}

// NewQuizHandler は新しいQuizHandlerを生成します。
func NewQuizHandler(hub *websocket.RoomHub) *QuizHandler {
	return &QuizHandler{hub: hub}
}

// ServeWs はHTTP接続をWebSocketにアップグレードします。
func (h *QuizHandler) ServeWs(c echo.Context) error {
	roomID := c.Param("roomId")
	userID := c.QueryParam("userId")

	if userID == "" {
		return c.String(http.StatusBadRequest, "userId query parameter is required")
	}

	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		log.Printf("error: failed to upgrade connection: %v", err)
		return err
	}

	// ここで使う 'websocket' は、自作したパッケージを指します。
	client := &websocket.Client{
		Hub:    h.hub,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		RoomID: roomID,
		UserID: userID,
	}
	h.hub.Register(client) // ハブのメソッド経由で登録

	go client.WritePump()
	go client.ReadPump()

	return nil
}

// server/src/internal/feature/quiz/route.go
package quiz

import (
	"server/src/internal/feature/quiz/handler"
	"server/src/internal/feature/quiz/websocket"

	"github.com/labstack/echo/v4"
)

// RegisterRoutes はquiz機能のエンドポイントを登録します。
func RegisterRoutes(g *echo.Group, hub *websocket.RoomHub) {
	h := handler.NewQuizHandler(hub)

	// WebSocket接続用のエンドポイント
	// 例: /api/quiz/ws/room123?userId=userABC
	g.GET("/ws/:roomId", h.ServeWs)
}

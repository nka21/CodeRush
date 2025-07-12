// server/src/internal/feature/quiz/route.go
package quiz

import (
	"server/src/internal/feature/quiz/handler"
	"server/src/internal/feature/quiz/service"
	"server/src/internal/feature/quiz/websocket"

	"github.com/labstack/echo/v4"
)

// シグネチャが (g *echo.Group, hub *websocket.RoomHub, quizSvc *service.QuizService) となっており、
// main.goでの呼び出しと一致していることを確認します。
func RegisterRoutes(g *echo.Group, hub *websocket.RoomHub, quizSvc *service.QuizService) {
	// handlerにserviceを渡す
	h := handler.NewQuizHandler(hub, quizSvc)

	g.GET("/ws/:roomId", h.ServeWs)
	g.POST("/start/:roomId", h.StartGame) // ホストがゲームを開始するエンドポイント
}

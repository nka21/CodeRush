// server/src/internal/feature/room/route.go
package room

import (
	"server/src/internal/database"
	"server/src/internal/feature/room/handler"
	"server/src/internal/feature/room/repository"
	"server/src/internal/feature/room/service"

	"github.com/labstack/echo/v4"
)

// RegisterRoutes はroom機能の依存関係を解決し、ルートを登録します。
// ★★★ main.goからdbハンドラを受け取れるように、引数を追加 ★★★
func RegisterRoutes(g *echo.Group, db *database.DBHandler) {
	// 依存関係を組み立てる
	repo := repository.NewRoomRepository(db)
	svc := service.NewRoomService(repo)
	h := handler.NewRoomHandler(svc)

	// ルート定義
	g.POST("", h.CreateRoom)
	g.GET("/:id", h.GetRoom)
	g.DELETE("/:id", h.DeleteRoom)
	g.POST("/:id/join", h.JoinRoom)
}

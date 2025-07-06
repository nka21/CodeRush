package room

import (
	"server/src/internal/feature/room/handler"
	"server/src/internal/feature/room/repository"
	"server/src/internal/feature/room/service"
	"server/src/internal/database"


	"log"
	"github.com/labstack/echo/v4"
)

func RegisterRoutes(g *echo.Group) {
	// --- 依存解決（DI） ---
	db, err := database.NewDBConnection() // ← DBの場所を使う
	if err != nil {
		log.Fatalf("DB 初期化失敗: %v", err)
	}
	repo := repository.NewRoomRepository(db);
	svc := service.NewRoomService(repo)
	h := handler.NewRoomHandler(svc)

	// --- ルート定義 ---
	g.POST("", h.CreateRoom)
	g.GET("/:id", h.GetRoom)
	g.DELETE("/:id", h.DeleteRoom)
	g.POST("/:id/join", h.JoinRoom)
}

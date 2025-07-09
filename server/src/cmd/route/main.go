// server/src/cmd/main.go
package main

import (
	"log"
	"server/src/config"
	"server/src/internal/database"
	"server/src/internal/feature/quiz"
	"server/src/internal/feature/quiz/websocket"
	"server/src/internal/feature/room"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	cfg := config.Load()

	db, err := database.NewDBHandler(cfg.DBPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// WebSocket Hubを生成し、バックグラウンドで実行
	// 関数名を NewHub から NewRoomHub に修正
	hub := websocket.NewRoomHub()
	go hub.Run()

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	api := e.Group("/api")

	// 既存のroom機能と新しいquiz機能のルートを登録
	// これで引数の数が一致する
	room.RegisterRoutes(api.Group("/room"), db)
	quiz.RegisterRoutes(api.Group("/quiz"), hub)

	log.Println("Server starting on port 8080...")
	if err := e.Start(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

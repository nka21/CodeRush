// server/src/cmd/main.go
package main

import (
	"log"
	"server/src/internal/database"
	"server/src/internal/feature/quiz"
	"server/src/internal/feature/quiz/service" // serviceをインポート
	"server/src/internal/feature/quiz/websocket"
	"server/src/internal/feature/room"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {

	db, err := database.NewDBConnection()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	// WebSocket Hubを生成
	hub := websocket.NewRoomHub(db)

	// QuizServiceを生成
	quizSvc := service.NewQuizService(hub)

	// HubにQuizServiceをMessageProcessorとして設定
	hub.Processor = quizSvc

	// Hubをバックグラウンドで実行
	go hub.Run()

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	api := e.Group("/api")

    api.GET("/", func(c echo.Context) error {
        return c.String(200, "OK")
    })
	room.RegisterRoutes(api.Group("/room"), db)
	// quiz.RegisterRoutes に quizSvc を渡す
	quiz.RegisterRoutes(api.Group("/quiz"), hub, quizSvc)

	log.Println("Server starting on port 8080...")
	if err := e.Start(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

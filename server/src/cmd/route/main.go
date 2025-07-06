// server/src/cmd/main.
// アプリケーションのエントリーポイント
package main

import (
	"log"

	"server/src/internal/feature/quiz"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Echoインスタンスの作成
	e := echo.New()

	api := e.Group("/api")

	// 各機能のルート登録
	quiz.RegisterRoutes(api.Group("/room"))

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// サーバーの起動
	log.Println("Server starting on port 8080...")
	if err := e.Start(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

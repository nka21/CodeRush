// server/src/cmd/main.
// アプリケーションのエントリーポイント
package main

import (
	"log"
	"path/filepath"
	"runtime"

	"server/src/internal/database"
	"server/src/internal/quiz/handler"
	"server/src/internal/quiz/repository"
	"server/src/internal/quiz/service"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// --- パス解決のロジックを追加 ---
	// このファイル(main.go)の絶対パスを取得
	_, b, _, ok := runtime.Caller(0)
	if !ok {
		log.Fatal("Failed to get current file path")
	}
	// プロジェクトのルートディレクトリを計算します。
	// main.goの場所から3階層上に遡ることで、プロジェクトルート(server/)に到達します。
	projectRoot := filepath.Join(filepath.Dir(b), "..", "..", "..")
	// db.jsonへの絶対パスを作成
	dbPath := filepath.Join(projectRoot, "mock", "db.json")
	log.Printf("Attempting to use database file at: %s", dbPath)
	// --- ここまで ---

	// 依存関係の注入 (Dependency Injection)
	// データベースハンドラを初期化 (修正した絶対パスを使用)
	db, err := database.NewDBHandler(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize database handler: %v", err)
	}

	// 各レイヤーのインスタンスを生成
	quizRepo := repository.NewQuizRepository(db)
	quizService := service.NewQuizService(quizRepo)
	quizHandler := handler.NewQuizHandler(quizService)

	// Echoインスタンスの作成
	e := echo.New()

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// ルーティング
	v1 := e.Group("/v1")
	{
		v1.POST("/rooms", quizHandler.CreateRoom)
		v1.GET("/rooms/:id", quizHandler.GetRoom)
		v1.DELETE("/rooms/:id", quizHandler.DeleteRoom)
		v1.POST("/rooms/:id/join", quizHandler.JoinRoom)
	}

	// サーバーの起動
	log.Println("Server starting on port 8080...")
	if err := e.Start(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

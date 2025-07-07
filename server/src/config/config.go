
package config

import (
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

type Config struct {
	Env    string
	Port   string
	DBPath string
}

func Load() *Config {
	// 実行環境のENV変数を確認（ENV=local など）
	env := os.Getenv("ENV")
	if env == "" {
		env = "local" // デフォルトは local
	}

	envFile := filepath.Join("config", ".env."+env)

	// 例: config/.env.local または config/.env.prod
	err := godotenv.Load(envFile)
	if err != nil {
		log.Printf("⚠️  %s の読み込みに失敗: %v", envFile, err)
	}

	return &Config{
		Env:    env,
		Port:   getEnv("PORT", "8080"),
		DBPath: getEnv("DB_PATH", "../mock/db.json"),
	}
}

func getEnv(key string, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}

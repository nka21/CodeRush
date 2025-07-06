// backend/src/internal/database/config.go
// データベース（JSONファイル）設定
package database

// DBConfig はデータベース（今回はJSONファイル）へのパスを保持します。
type DBConfig struct {
	FilePath string
}

// backend/src/internal/database/database.go
// データベース（JSONファイル）へのアクセスロジック
package database

import (
	"encoding/json"
	"os"
	"sync"
	"server/src/internal/quiz/types"
)

// DBHandler はJSONファイルへの読み書きを安全に行うためのハンドラです。
type DBHandler struct {
	filePath string
	mu       sync.RWMutex // ファイルへの同時アクセスを制御するためのMutex
}

// RoomsDB はJSONファイルのトップレベル構造に対応します。
type RoomsDB struct {
	Rooms map[string]types.Room `json:"rooms"`
}

// NewDBHandler は新しいDBHandlerを初期化します。
func NewDBHandler(filePath string) (*DBHandler, error) {
	// ファイルが存在しない場合は、空のDBを作成する
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		initialDB := &RoomsDB{Rooms: make(map[string]types.Room)}
		data, _ := json.MarshalIndent(initialDB, "", "  ")
		if err := os.WriteFile(filePath, data, 0644); err != nil {
			return nil, err
		}
	}
	return &DBHandler{filePath: filePath}, nil
}

// ReadDB はJSONファイルから全データを読み込みます。
func (h *DBHandler) ReadDB() (*RoomsDB, error) {
	h.mu.RLock() // 読み込みロック
	defer h.mu.RUnlock()

	data, err := os.ReadFile(h.filePath)
	if err != nil {
		return nil, err
	}

	var db RoomsDB
	if err := json.Unmarshal(data, &db); err != nil {
		return nil, err
	}
	return &db, nil
}

// WriteDB は指定されたデータをJSONファイルに書き込みます。
func (h *DBHandler) WriteDB(db *RoomsDB) error {
	h.mu.Lock() // 書き込みロック
	defer h.mu.Unlock()

	data, err := json.MarshalIndent(db, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(h.filePath, data, 0644)
}

// backend/src/internal/feature/quiz/repository/repository.go
// データ永続化層の実装
package repository

import (
	"errors"
	"server/src/internal/database"
	"server/src/internal/quiz/types"
)

// QuizRepository はルームデータへのアクセスを担当します。
type QuizRepository struct {
	db *database.DBHandler
}

// NewQuizRepository は新しいリポジトリインスタンスを生成します。
func NewQuizRepository(db *database.DBHandler) *QuizRepository {
	return &QuizRepository{db: db}
}

// CreateRoom は新しいルームをDBに保存します。
func (r *QuizRepository) CreateRoom(room *types.Room) (*types.Room, error) {
	db, err := r.db.ReadDB()
	if err != nil {
		return nil, err
	}

	if _, exists := db.Rooms[room.RoomID]; exists {
		return nil, errors.New("room ID already exists")
	}

	db.Rooms[room.RoomID] = *room

	if err := r.db.WriteDB(db); err != nil {
		return nil, err
	}
	return room, nil
}

// FindRoomByID はIDでルームを検索します。
func (r *QuizRepository) FindRoomByID(id string) (*types.Room, error) {
	db, err := r.db.ReadDB()
	if err != nil {
		return nil, err
	}

	room, exists := db.Rooms[id]
	if !exists {
		return nil, errors.New("room not found")
	}
	return &room, nil
}

// DeleteRoom はIDでルームを削除します。
func (r *QuizRepository) DeleteRoom(id string) error {
	db, err := r.db.ReadDB()
	if err != nil {
		return err
	}

	if _, exists := db.Rooms[id]; !exists {
		return errors.New("room not found")
	}

	delete(db.Rooms, id)
	return r.db.WriteDB(db)
}

// UpdateRoom は既存のルーム情報を更新します。
func (r *QuizRepository) UpdateRoom(room *types.Room) (*types.Room, error) {
	db, err := r.db.ReadDB()
	if err != nil {
		return nil, err
	}

	if _, exists := db.Rooms[room.RoomID]; !exists {
		return nil, errors.New("room not found")
	}

	db.Rooms[room.RoomID] = *room
	if err := r.db.WriteDB(db); err != nil {
		return nil, err
	}
	return room, nil
}

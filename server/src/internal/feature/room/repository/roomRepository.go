
package repository

import (
	"errors"
	"server/src/internal/database"
	"server/src/internal/feature/room/types"
	"server/src/internal/feature/room/utils"
)

type RoomRepository struct {
	db *database.DBHandler
}

func NewRoomRepository(db *database.DBHandler) *RoomRepository {
	return &RoomRepository{db: db}
}

// CreateRoom は新しいルームを作成（すでに存在する場合はエラー）
func (r *RoomRepository) CreateRoom(room *types.Room) (*types.Room, error) {
	existing, err := r.db.ReadDB(room.RoomID)
	if err == nil && existing != nil {
		return nil, errors.New("room ID already exists")
	}

	err = r.db.WriteDB(room)
	if err != nil {
		return nil, err
	}
	return room, nil
}

// FindRoomByID は DynamoDB からルームを取得
func (r *RoomRepository) FindRoomByID(id string) (*types.Room, error) {
	room, err := r.db.ReadDB(id)
	if err != nil {
		return nil, utils.ErrRoomNotFound
	}
	return room, nil
}

// DeleteRoom は DynamoDB からルームを削除
func (r *RoomRepository) DeleteRoom(id string) error {
	return r.db.DeleteRoom(id)
}

// UpdateRoom は DynamoDB にルーム情報を上書き
func (r *RoomRepository) UpdateRoom(room *types.Room) (*types.Room, error) {
	returned, err := r.db.ReadDB(room.RoomID)
	if err != nil || returned == nil {
		return nil, errors.New("room not found")
	}
	if err := r.db.WriteDB(room); err != nil {
		return nil, err
	}
	return room, nil
}

// backend/src/internal/feature/quiz/service/service.go
// ビジネスロジックの実装
package service

import (
	"crypto/rand"
	"errors"
	"fmt"
	"time"
	"server/src/internal/feature/room/utils"
	"server/src/internal/feature/room/repository"
	"server/src/internal/feature/room/types"
)

// QuizService はクイズ機能のビジネスロジックを担当します。
type RoomService struct {
	repo *repository.RoomRepository
}

// NewQuizService は新しいサービスインスタンスを生成します。
func NewRoomService(repo *repository.RoomRepository) *RoomService {
	return &RoomService{repo: repo}
}

// CreateRoom はルーム作成のロジックを処理します。
func (s *RoomService) CreateRoom(req *types.RoomCreationRequest) (*types.Room, error) {
	roomID := req.RoomID
	if roomID == "" {
		roomID = generateRandomID()
	}

	// 本来は認証情報から取得するが、今回は仮のIDを使用
	hostID := "user_" + generateRandomID()

	newRoom := &types.Room{
		RoomID:    roomID,
		HostID:    hostID,
		Settings:  req.Settings,
		Players:   make(map[string]types.Player),
		GameState: "waiting",
		CreatedAt: time.Now().UTC(),
	}
	// ホストをプレイヤーとして追加
	newRoom.Players[hostID] = types.Player{Name: "Host", Score: 0, IsReady: true}

	return s.repo.CreateRoom(newRoom)
}

// GetRoom はルーム情報を取得します。
func (s *RoomService) GetRoom(id string) (*types.Room, error) {
	return s.repo.FindRoomByID(id)
}

// DeleteRoom はルームを削除します。
func (s *RoomService) DeleteRoom(id, userID string) error {
	room, err := s.repo.FindRoomByID(id)
	if err != nil {
		if errors.Is(err, utils.ErrRoomNotFound) {
			return fmt.Errorf("%w", utils.ErrRoomNotFound) // ← ラップする
		}
		return err // その他のエラー
	}
	// ホストのみが削除可能というビジネスルール
	if room.HostID != userID {
		fmt.Println("Hello, world")
	}
	return s.repo.DeleteRoom(id)
}

// JoinRoom はゲストがルームに参加するロジックを処理します。
func (s *RoomService) JoinRoom(id string, req *types.JoinRequest) (*types.Room, error) {
	room, err := s.repo.FindRoomByID(id)
	if err != nil {
		return nil, err
	}

	if room.GameState != "waiting" {
		return nil, errors.New("game has already started")
	}

	// 本来は認証情報から取得するが、今回は仮のIDを使用
	playerID := "user_" + generateRandomID()
	if _, exists := room.Players[playerID]; exists {
		return nil, errors.New("user already in room")
	}
	//人数がオーバーした場合エラーを返却
	const maxPlayers = 4
	if len(room.Players) >= maxPlayers {
		return nil, errors.New("the room is full")
	}

	room.Players[playerID] = types.Player{Name: req.PlayerName, Score: 0, IsReady: false}

	return s.repo.UpdateRoom(room)
}

// generateRandomID はランダムなIDを生成するヘルパー関数
func generateRandomID() string {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		fmt.Printf("Error generating random ID: %v\n", err)
		return ""
	}
	return fmt.Sprintf("%x", b)
}

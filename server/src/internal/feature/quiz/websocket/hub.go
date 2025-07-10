// server/src/internal/feature/quiz/websocket/hub.go
package websocket

import (
	"encoding/json"
	"log"
	// "types"パッケージを正しくインポートします
	"server/src/internal/feature/quiz/types"
	"sync"
)

// RoomHub は全ルームの全クライアントを管理します。
type RoomHub struct {
	// 各ルームのクライアントを保持します。
	// キー: roomID, 値: クライアントのセット
	rooms map[string]map[*Client]bool

	// roomsマップへの同時アクセスを保護します。
	mu sync.RWMutex

	// クライアントからの登録リクエスト
	register chan *Client

	// クライアントからの登録解除リクエスト
	unregister chan *Client

	// 特定のルームへのメッセージブロードキャストリクエスト
	broadcast chan *types.Message
}

// NewRoomHub は新しいRoomHubインスタンスを生成し、実行します。
func NewRoomHub() *RoomHub {
	return &RoomHub{
		rooms:      make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *types.Message),
	}
}

// Run はハブのメインループです。チャネルからの要求を待ち受けます。
func (h *RoomHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.handleRegister(client)
		case client := <-h.unregister:
			h.handleUnregister(client)
		case message := <-h.broadcast:
			h.handleBroadcast(message)
		}
	}
}

// Register はクライアントを登録チャネルに送ります。
func (h *RoomHub) Register(client *Client) {
	h.register <- client
}

// Unregister はクライアントを登録解除チャネルに送ります。
func (h *RoomHub) Unregister(client *Client) {
	h.unregister <- client
}

// Broadcast はメッセージをブロードキャストチャネルに送ります。
func (h *RoomHub) Broadcast(message *types.Message) {
	h.broadcast <- message
}

func (h *RoomHub) handleRegister(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	roomID := client.RoomID
	if _, ok := h.rooms[roomID]; !ok {
		h.rooms[roomID] = make(map[*Client]bool)
	}
	h.rooms[roomID][client] = true
	log.Printf("Client %s registered to room %s", client.UserID, roomID)

	// 参加イベントを作成してブロードキャストチャネルに送る
	joinMsg := &types.Message{
		Type:    "user_joined",
		Payload: map[string]string{"userId": client.UserID},
		RoomID:  roomID,
	}
	// handleBroadcastを直接呼ぶのではなく、チャネル経由で処理を依頼する
	go h.Broadcast(joinMsg)
}

func (h *RoomHub) handleUnregister(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	roomID := client.RoomID
	if room, ok := h.rooms[roomID]; ok {
		if _, ok := room[client]; ok {
			delete(h.rooms[roomID], client)
			close(client.Send)
			log.Printf("Client %s unregistered from room %s", client.UserID, roomID)

			if len(h.rooms[roomID]) == 0 {
				delete(h.rooms, roomID)
				log.Printf("Room %s closed", roomID)
			} else {
				// 退出イベントを作成してブロードキャストチャネルに送る
				leaveMsg := &types.Message{
					Type:    "user_left",
					Payload: map[string]string{"userId": client.UserID},
					RoomID:  roomID,
				}
				go h.Broadcast(leaveMsg)
			}
		}
	}
}

func (h *RoomHub) handleBroadcast(message *types.Message) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	roomID := message.RoomID
	if room, ok := h.rooms[roomID]; ok {
		jsonMsg, err := json.Marshal(message)
		if err != nil {
			log.Printf("error: failed to marshal broadcast message: %v", err)
			return
		}

		for client := range room {
			select {
			case client.Send <- jsonMsg:
			default:
				// 送信チャネルが詰まっている場合は、クライアントを強制的に切断
				// handleUnregisterを直接呼ぶとデッドロックの可能性があるため、
				// ゴルーチンで安全に実行する
				go h.Unregister(client)
			}
		}
	}
}

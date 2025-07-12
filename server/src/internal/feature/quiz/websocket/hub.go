// server/src/internal/feature/quiz/websocket/hub.go
package websocket

import (
	"encoding/json"
	"log"
	"server/src/internal/feature/quiz/types"
	"sync"
)

// MessageProcessor はクライアントからのメッセージを処理する責務を持つインターフェースです。
type MessageProcessor interface {
	ProcessClientMessage(roomID, userID string, message []byte)
}

type RoomHub struct {
	rooms      map[string]map[*Client]bool
	mu         sync.RWMutex
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan *types.Message
	Inbound    chan *InboundMessage
	Processor  MessageProcessor
}

func NewRoomHub() *RoomHub {
	return &RoomHub{
		rooms:      make(map[string]map[*Client]bool),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *types.Message),
		Inbound:    make(chan *InboundMessage),
	}
}

func (h *RoomHub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.registerClient(client)
		case client := <-h.Unregister:
			h.unregisterClient(client)
		case message := <-h.Broadcast:
			h.broadcastMessage(message)
		case inboundMessage := <-h.Inbound:
			if h.Processor != nil {
				client := inboundMessage.Client
				h.Processor.ProcessClientMessage(client.RoomID, client.UserID, inboundMessage.Message)
			}
		}
	}
}

func (h *RoomHub) registerClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	roomID := client.RoomID
	if _, ok := h.rooms[roomID]; !ok {
		h.rooms[roomID] = make(map[*Client]bool)
	}
	h.rooms[roomID][client] = true
	log.Printf("Client %s registered to room %s", client.UserID, roomID)
	joinMsg := &types.Message{
		Type:    "user_joined",
		Payload: map[string]string{"userId": client.UserID},
		RoomID:  roomID,
	}
	// このメソッドはRun goroutineから呼ばれるため、直接broadcastMessageを呼ぶとデッドロックの可能性がある
	// Broadcastチャネルに送信するのが安全
	go func() {
		h.Broadcast <- joinMsg
	}()
}

func (h *RoomHub) unregisterClient(client *Client) {
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
				leaveMsg := &types.Message{
					Type:    "user_left",
					Payload: map[string]string{"userId": client.UserID},
					RoomID:  roomID,
				}
				go func() {
					h.Broadcast <- leaveMsg
				}()
			}
		}
	}
}

func (h *RoomHub) broadcastMessage(message *types.Message) {
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
				// 送信に失敗した場合（チャネルがブロックされている）、クライアントを切断
				log.Printf("Client %s send buffer is full. Unregistering.", client.UserID)
				// ★★★ ここが修正点 ★★★
				// 関数呼び出しではなくチャネルに送信する
				h.Unregister <- client

			}
		}
	}
}

func (h *RoomHub) GetClientIDs(roomID string) []string {
	h.mu.RLock()
	defer h.mu.RUnlock()

	var userIDs []string
	if room, ok := h.rooms[roomID]; ok {
		for client := range room {
			userIDs = append(userIDs, client.UserID)
		}
	}
	return userIDs
}

// server/src/internal/feature/quiz/handler/quizHandler.go
package handler

import (
	"log"
	"net/http"
	"server/src/internal/feature/quiz/service"
	"server/src/internal/feature/quiz/websocket"
	ws "github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

var upgrader = ws.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type QuizHandler struct {
	hub     *websocket.RoomHub
	service *service.QuizService
}

func NewQuizHandler(hub *websocket.RoomHub, svc *service.QuizService) *QuizHandler {
	return &QuizHandler{hub: hub, service: svc}
}

func (h *QuizHandler) StartGame(c echo.Context) error {
	roomID := c.Param("roomId")
	if err := h.service.StartGame(roomID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Game started successfully"})
}

func (h *QuizHandler) ServeWs(c echo.Context) error {
	roomID := c.Param("roomId")
	userID := c.QueryParam("userId")

	if userID == "" {
		return c.String(http.StatusBadRequest, "userId query parameter is required")
	}

	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		log.Printf("error: failed to upgrade connection: %v", err)
		return err
	}

	client := &websocket.Client{
		Hub:    h.hub,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		RoomID: roomID,
		UserID: userID,
	}
	h.hub.Register <- client

	go client.WritePump()
	go client.ReadPump()

	return nil
}

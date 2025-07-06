// backend/src/internal/feature/quiz/handler/handler.go
// HTTPリクエストを処理するハンドラの実装
package handler

import (
	"net/http"

	"server/src/internal/quiz/service"
	"server/src/internal/quiz/types"
	"github.com/labstack/echo/v4"
)

// QuizHandler はHTTPリクエストを対応するサービスロジックにルーティングします。
type QuizHandler struct {
	service *service.QuizService
}

// NewQuizHandler は新しいハンドラインスタンスを生成します。
func NewQuizHandler(s *service.QuizService) *QuizHandler {
	return &QuizHandler{service: s}
}

// CreateRoom は POST /rooms のリクエストを処理します。
func (h *QuizHandler) CreateRoom(c echo.Context) error {
	req := new(types.RoomCreationRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, types.ErrorResponse{Message: "Invalid request body"})
	}

	room, err := h.service.CreateRoom(req)
	if err != nil {
		return c.JSON(http.StatusConflict, types.ErrorResponse{Message: err.Error()})
	}
	return c.JSON(http.StatusCreated, room)
}

// GetRoom は GET /rooms/:id のリクエストを処理します。
func (h *QuizHandler) GetRoom(c echo.Context) error {
	id := c.Param("id")
	room, err := h.service.GetRoom(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, types.ErrorResponse{Message: err.Error()})
	}
	return c.JSON(http.StatusOK, room)
}

// DeleteRoom は DELETE /rooms/:id のリクエストを処理します。
func (h *QuizHandler) DeleteRoom(c echo.Context) error {
	id := c.Param("id")
	// 本来は認証ミドルウェアから取得する
	userID := "user_temp_host_id" // 仮のホストID

	err := h.service.DeleteRoom(id, userID)
	if err != nil {
		// エラーの種類によってステータスコードを分ける
		if err.Error() == "room not found" {
			return c.JSON(http.StatusNotFound, types.ErrorResponse{Message: err.Error()})
		}
		if err.Error() == "only the host can delete the room" {
			return c.JSON(http.StatusForbidden, types.ErrorResponse{Message: err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, types.ErrorResponse{Message: err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}

// JoinRoom は POST /rooms/:id/join のリクエストを処理します。
func (h *QuizHandler) JoinRoom(c echo.Context) error {
	id := c.Param("id")
	req := new(types.JoinRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, types.ErrorResponse{Message: "Invalid request body"})
	}
	if req.PlayerName == "" {
		return c.JSON(http.StatusBadRequest, types.ErrorResponse{Message: "Player name is required"})
	}

	room, err := h.service.JoinRoom(id, req)
	if err != nil {
		if err.Error() == "room not found" {
			return c.JSON(http.StatusNotFound, types.ErrorResponse{Message: err.Error()})
		}
		return c.JSON(http.StatusConflict, types.ErrorResponse{Message: err.Error()})
	}
	return c.JSON(http.StatusOK, room)
}

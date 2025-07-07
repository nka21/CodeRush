package utils

import "errors"

var (
	ErrRoomNotFound       = errors.New("room not found")
	ErrNotHostPermission  = errors.New("only the host can delete the room")
)

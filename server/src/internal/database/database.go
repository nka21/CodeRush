// backend/src/internal/database/dynamodb.go
package database

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	roomtypes "server/src/internal/feature/room/types"
)

type DBHandler struct {
	client    *dynamodb.Client
	tableName string
}

func NewDBConnection() (*DBHandler, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, fmt.Errorf("unable to load AWS config: %w", err)
	}

	client := dynamodb.NewFromConfig(cfg)

	tableName := os.Getenv("DYNAMO_TABLE")

	if tableName == "" {
		tableName = "quiz" // デフォルト名
	}

	tableName = "quiz"

	return &DBHandler{
		client:    client,
		tableName: tableName,
	}, nil
}


// ルームを1件取得
func (h *DBHandler) ReadDB(id string) (*roomtypes.Room, error) {
	resp, err := h.client.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String(h.tableName),
		Key: map[string]types.AttributeValue{
			"room_id": &types.AttributeValueMemberS{Value: id},
		},
	})
	if err != nil {
		return nil, err
	}
	if resp.Item == nil {
		return nil, fmt.Errorf("room not found")
	}

	var room roomtypes.Room
	err = attributevalue.UnmarshalMap(resp.Item, &room)
	if err != nil {
		return nil, err
	}

	return &room, nil
}

// ルームを保存（Put）
func (h *DBHandler) WriteDB(room *roomtypes.Room) error {
	item, err := attributevalue.MarshalMap(room)
	if err != nil {
		return err
	}

	_, err = h.client.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String(h.tableName),
		Item:      item,
	})
	return err
}


func (h *DBHandler) DeleteRoom(roomID string) error {
	_, err := h.client.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
		TableName: aws.String(h.tableName),
		Key: map[string]types.AttributeValue{
			"room_id": &types.AttributeValueMemberS{Value: roomID},
		},
	})
	return err
}

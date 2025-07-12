// server/src/internal/feature/quiz/service/quizService.go
package service

import (
	"encoding/json"
	"log"
	"math/rand"
	"server/src/internal/feature/quiz/types"
	"server/src/internal/feature/quiz/websocket"
	"sort"
	"sync"
	"time"
)

const TOTAL_QUESTIONS = 10

type QuizService struct {
	hub        *websocket.RoomHub
	questions  []types.Question
	gameStates map[string]*types.GameState
	mu         sync.RWMutex
}

func NewQuizService(hub *websocket.RoomHub) *QuizService {
	questions := loadDummyQuestions()
	return &QuizService{
		hub:        hub,
		questions:  questions,
		gameStates: make(map[string]*types.GameState),
	}
}

func (s *QuizService) StartGame(roomID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	playerIDs := s.hub.GetClientIDs(roomID)
	initialScores := make(map[string]int)
	for _, id := range playerIDs {
		initialScores[id] = 0 // 全員のスコアを0で初期化
	}

	// 既存のゲームステートがあればリセット
	newState := &types.GameState{
		Scores:           initialScores, // 初期化されたスコアマップを使用
		AnsweredUsers:    make(map[string]bool),
		QuestionNumber:   0,
		IsQuestionActive: false,
	}

	s.gameStates[roomID] = newState
	log.Printf("Game started in room %s", roomID)
	s.nextQuestion(roomID)
	return nil
}

// ProcessClientMessage はクライアントからのメッセージを処理します。
func (s *QuizService) ProcessClientMessage(roomID, userID string, message []byte) {
	var msg types.Message
	if err := json.Unmarshal(message, &msg); err != nil {
		log.Printf("error: cannot unmarshal message: %v", err)
		return
	}
	switch msg.Type {
	case "answer":
		s.processAnswer(roomID, userID, msg.Payload)
	// 他のメッセージタイプが必要な場合はここに追加
	default:
		log.Printf("Unknown message type: %s", msg.Type)
	}
}

// processAnswer はユーザーからの回答を処理します。
func (s *QuizService) processAnswer(roomID, userID string, payload interface{}) {
	s.mu.Lock()

	state, ok := s.gameStates[roomID]
	if !ok {
		s.mu.Unlock()
		log.Printf("error: game state not found for room %s", roomID)
		return
	}

	if !state.IsQuestionActive {
		s.mu.Unlock()
		return
	}

	// ★ 既に回答済みのユーザーは無視
	if state.AnsweredUsers[userID] {
		s.mu.Unlock()
		return
	}

	payloadMap, ok := payload.(map[string]interface{})
	if !ok {
		s.mu.Unlock()
		return
	}
	answer, _ := payloadMap["answer"].(string)

	isCorrect := (answer == state.CurrentQuestion.Answer)
	if isCorrect {
		state.Scores[userID] += 10
	}
	state.AnsweredUsers[userID] = true

	// ★ 最初の回答者が来た時点で回答受付終了
	state.IsQuestionActive = false

	resultMsg := &types.Message{
		Type: "answer_result",
		Payload: map[string]interface{}{
			"userId":        userID,
			"isCorrect":     isCorrect,
			"correctAnswer": state.CurrentQuestion.Answer,
			"scores":        state.Scores,
		},
		RoomID: roomID,
	}

	s.mu.Unlock()

	go func() {
		s.hub.Broadcast <- resultMsg
	}()

	// 3秒後に次の問題へ進む
	go func() {
		time.Sleep(3 * time.Second)
		s.mu.Lock()
		defer s.mu.Unlock()
		s.nextQuestion(roomID)
	}()
}

// nextQuestion は次の問題を出題するか、ゲームを終了します。
func (s *QuizService) nextQuestion(roomID string) {
	state, ok := s.gameStates[roomID]
	if !ok {
		return
	}

	// 10問終わったらゲーム終了
	if state.QuestionNumber >= TOTAL_QUESTIONS {
		s.endGame(roomID)
		return
	}

	state.QuestionNumber++
	state.CurrentQuestion = s.getRandomQuestion()
	state.AnsweredUsers = make(map[string]bool)
	state.IsQuestionActive = true // 回答受付開始

	message := &types.Message{
		Type: "question_start",
		Payload: map[string]interface{}{
			"questionNumber": state.QuestionNumber,
			"question":       state.CurrentQuestion.Statement,
			"choices":        state.CurrentQuestion.Choices,
		},
		RoomID: roomID,
	}
	s.hub.Broadcast <- message
}

// endGame はゲームを終了し、最終結果を送信します。
func (s *QuizService) endGame(roomID string) {
	state, ok := s.gameStates[roomID]
	if !ok {
		return
	}

	// スコアに基づいてランキングを作成
	results := make([]types.PlayerResult, 0, len(state.Scores))
	for userID, score := range state.Scores {
		results = append(results, types.PlayerResult{UserID: userID, Score: score})
	}

	// スコアで降順ソート
	sort.Slice(results, func(i, j int) bool {
		return results[i].Score > results[j].Score
	})

	// ランクを割り当て
	if len(results) > 0 {
		// 最初のプレイヤーは必ず1位
		results[0].Rank = 1
		for i := 1; i < len(results); i++ {
			// 前のプレイヤーとスコアが同じ場合、同じ順位にする
			if results[i].Score == results[i-1].Score {
				results[i].Rank = results[i-1].Rank
			} else {
				// スコアが異なる場合、現在のインデックス+1を順位とする
				results[i].Rank = i + 1
			}
		}
	}

	message := &types.Message{
		Type:    "game_over",
		Payload: results,
		RoomID:  roomID,
	}
	s.hub.Broadcast <- message

	// ゲーム状態を削除 (またはリセットして待機状態に戻す)
	delete(s.gameStates, roomID)
	log.Printf("Game ended in room %s", roomID)
}


// ... (getRandomQuestion, loadDummyQuestions は変更なし)
func (s *QuizService) getRandomQuestion() *types.Question {
	if len(s.questions) == 0 {
		return nil
	}
	return &s.questions[rand.Intn(len(s.questions))]
}

func loadDummyQuestions() []types.Question {
	return []types.Question{
		{ID: "q1", Statement: "Go言語で、パッケージ内の非公開な関数や変数を定義する際の命名規則は？", Choices: []string{"先頭を小文字にする", "先頭を大文字にする", "アンダースコアで始める", "予約語を使う"}, Answer: "先頭を小文字にする"},
		{ID: "q2", Statement: "HTTPステータスコードで、「Not Found」を意味するのは？", Choices: []string{"200", "301", "404", "500"}, Answer: "404"},
		{ID: "q3", Statement: "gorilla/websocketパッケージの`Upgrader`の役割は？", Choices: []string{"メッセージの暗号化", "HTTP接続のアップグレード", "クライアントの管理", "エラーハンドリング"}, Answer: "HTTP接続のアップグレード"},
		{ID: "q4", Statement: "JSONのパースに使用するGoの標準パッケージは？", Choices: []string{"encoding/json", "fmt", "strings", "net/http"}, Answer: "encoding/json"},
		{ID: "q5", Statement: "Goのgoroutineを開始するキーワードは？", Choices: []string{"go", "async", "thread", "run"}, Answer: "go"},
		{ID: "q6", Statement: "Goのスライスの長さを取得する関数は？", Choices: []string{"len()", "size()", "length()", "count()"}, Answer: "len()"},
		{ID: "q7", Statement: "Goのマップを初期化する方法は？", Choices: []string{"make(map[string]int)", "new(map[string]int)", "map[string]int{}", "両方A,C"}, Answer: "両方A,C"},
		{ID: "q8", Statement: "Goのエラーハンドリングで使用する型は？", Choices: []string{"error", "Error", "exception", "Exception"}, Answer: "error"},
		{ID: "q9", Statement: "Goのチャネルを作成する関数は？", Choices: []string{"make()", "new()", "create()", "channel()"}, Answer: "make()"},
		{ID: "q10", Statement: "Goの構造体のフィールドを公開するには？", Choices: []string{"先頭を大文字にする", "先頭を小文字にする", "publicキーワード", "exportキーワード"}, Answer: "先頭を大文字にする"},
	}
}

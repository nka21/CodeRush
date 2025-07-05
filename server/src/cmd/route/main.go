
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Todo struct {
	ID    int
	Done  bool
	Title string
	Body  string
}

// グローバル変数として宣言（:= は使えない）
var todos = []Todo{
	{ID: 1, Title: "掃除", Done: false, Body: "aaaaa"},
	{ID: 2, Title: "勉強", Done: true, Body: "golangを学ぶ"},
}

// GET: 一覧を取得
func getTodos(w http.ResponseWriter, r *http.Request) {
	fmt.Println("GET")

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(todos); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// POST: 新しい Todo を追加
func postTodo(w http.ResponseWriter, r *http.Request) {
	fmt.Println("POST")

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var todo Todo
	if err := json.NewDecoder(r.Body).Decode(&todo); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// ID を自動で割り当てたいならこうもできる
	todo.ID = len(todos) + 1

	// スライスに追加（appendの結果を代入する）
	todos = append(todos, todo)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todo)
}

func main() {
	fmt.Println("Starting the serve at :8080")

	http.HandleFunc("/", getTodos)
	http.HandleFunc("/post", postTodo)

	http.ListenAndServe(":8080", nil)
}

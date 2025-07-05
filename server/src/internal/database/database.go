package database

import (
    "database/sql"
    "fmt"
    _ "github.com/lib/pq" // PostgreSQLドライバ
)

// NewConnection は設定を元に新しいDB接続を確立して返す
func NewConnection(cfg *DBConfig) (*sql.DB, error) {
    // 例: "host=localhost port=5432 user=user password=pass dbname=mydb sslmode=disable"
    dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
        cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName)

    db, err := sql.Open("postgres", dsn)
    if err != nil {
        return nil, err
    }

    if err = db.Ping(); err != nil {
        return nil, err
    }

    return db, nil
}

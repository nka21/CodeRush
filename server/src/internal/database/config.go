package database

import "github.com/kelseyhightower/envconfig"

// DBConfig は .env から読み込むデータベース設定の構造体
type DBConfig struct {
    // 例: PostgreSQLの場合
    Host     string `envconfig:"DB_HOST" default:"localhost"`
    Port     int    `envconfig:"DB_PORT" default:"5432"`
    User     string `envconfig:"DB_USER" required:"true"`
    Password string `envconfig:"DB_PASSWORD" required:"true"`
    DBName   string `envconfig:"DB_NAME" required:"true"`
}

// LoadConfig は環境変数から設定を読み込む
func LoadConfig() (*DBConfig, error) {
    var cfg DBConfig
    err := envconfig.Process("", &cfg)
    if err != nil {
        return nil, err
    }
    return &cfg, nil
}

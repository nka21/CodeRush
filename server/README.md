# Server

Goで実装されたバックエンドサーバー

## ディレクトリ構成

```
server/
├── src/          # メインのGoプロジェクト
└── mock/         # モックデータ
```

## 開発環境のセットアップ

### 必要な環境

- Go 1.24.4以上

### 環境変数の設定

`src/config/.env.local.example`をコピーして`.env.local`を作成：

```bash
cd src/config
cp .env.local.example .env.local
```

### サーバーの起動

#### 開発モード（ホットリロード）

```bash
cd src
air -c config/.air.toml
```

#### 通常起動

```bash
cd src
go run cmd/route/main.go
```
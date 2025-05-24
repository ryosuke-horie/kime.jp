# Workers

Cloudflare Workers API サーバー

## セットアップ

```bash
npm install
npm run dev
```

## デプロイ

```bash
npm run deploy
```

## 型生成

Worker設定に基づいた型を生成・同期するには：

```bash
npm run cf-typegen
```

`Hono`インスタンス化時に`CloudflareBindings`をジェネリクスとして渡す：

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## マイグレーション管理

### 自動同期機能

本プロジェクトでは、本番用のDrizzleマイグレーションファイル（`.sql`）からテスト用のマイグレーション定義を自動生成する機能を提供しています。

#### 背景・意図

- **一貫性の保証**: 本番とテスト環境のデータベーススキーマの同期を自動化
- **人的ミスの削減**: 手動でのマイグレーション管理によるミスを防止
- **開発効率の向上**: マイグレーション追加時の手作業を削減
- **D1互換性**: Cloudflare D1データベースに特化した構文変換

#### 使用方法

```bash
# マイグレーション同期の実行
pnpm sync-migrations
```

このコマンドにより以下が自動実行されます：

1. `migrations/`ディレクトリの全SQLファイルを読み込み
2. Cloudflare D1互換形式に変換（バッククォート→ダブルクォート等）
3. `src/test/test-migrations.ts`にTypeScript形式で出力

#### 変換処理

- **バッククォート変換**: `` `table_name` `` → `"table_name"`
- **DEFAULT値修正**: `DEFAULT 'CURRENT_TIMESTAMP'` → `DEFAULT CURRENT_TIMESTAMP`
- **コメント削除**: `-- statement-breakpoint`コメントの除去
- **CHECK制約保護**: CHECK制約内のシングルクォートは保持

#### 使用シーン

- 新しいマイグレーションファイルを追加した後
- マイグレーションファイルを修正した後
- テスト環境のスキーマ同期が必要な場合

#### ファイル構成

```
apps/workers/
├── migrations/           # 本番用マイグレーションファイル
│   ├── 0000_*.sql
│   └── 0001_*.sql
├── scripts/
│   └── sync-migrations.ts # 同期スクリプト
├── src/test/
│   ├── test-migrations.ts # 自動生成されるテスト用定義
│   └── helpers/
│       ├── migration-converter.ts      # 変換ロジック
│       └── migration-converter.test.ts # テストコード
```

#### 注意事項

- `src/test/test-migrations.ts`は自動生成されるため、直接編集しないでください
- マイグレーション変更後は必ず同期コマンドを実行してください
- CI/CDパイプラインでの同期チェックを推奨します

## テスト

```bash
# 全テスト実行
pnpm test

# 特定テスト実行
pnpm test migration-converter.test.ts

# テスト環境セットアップ
pnpm test:setup
```

## その他のコマンド

```bash
# リント・フォーマット
pnpm format

# 型チェック
pnpm typecheck

# Drizzle Studio（DB管理UI）
pnpm studio
```
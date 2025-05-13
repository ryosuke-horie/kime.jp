# Durable Objects 実装確認ガイド

このドキュメントでは、Cloudflare Workers + Durable Objects（DO）の実装内容と、動作確認方法について説明します。

## 1. 実装内容の概要

本プロジェクトでは、以下の内容が実装されています：

### 1.1 Durable Objects の設定

- `wrangler.toml` に以下のDurable Objectsが設定されています：
  - `DatabaseDO`: SQLiteデータベースへのアクセスを管理
  - `ClassLocker`: 予約処理の整合性を確保するためのロック機構

```toml
# Durable Objects
[[durable_objects.bindings]]
name = "DB_DO"
class_name = "DatabaseDO"

[[durable_objects.bindings]]
name = "CLASS_LOCKER"
class_name = "ClassLocker"
```

### 1.2 DatabaseDO の実装

`src/objects/DatabaseDO.ts` には以下の機能が実装されています：

- Drizzle ORMを使用したSQLiteデータベースへのアクセス
- トランザクション処理機能
- 各データモデル（gyms, members, classes, bookings）のCRUD操作
- 特殊なビジネスロジック（予約の整合性確保など）

```typescript
// 主要なメソッド例

// トランザクション処理の例
private async handleBooking(data: any): Promise<Response> {
  // トランザクションを確保するために同時実行をブロック
  return await this.state.blockConcurrencyWhile(async () => {
    // データベース処理
    // ...
  });
}

// 標準的なCRUD処理の例
private async handleGetAll(tableName: string, queryParams?: any): Promise<Response> {
  try {
    const db = this.getDrizzleClient();
    const table = this.getTableByName(tableName);
    
    if (!table) {
      return new Response(
        JSON.stringify({ error: `Table ${tableName} not found` }),
        { status: 404 }
      );
    }
    
    // クエリ実行
    const results = await db.select().from(table).all();
    return new Response(JSON.stringify(results), { status: 200 });
  } catch (error) {
    return this.handleError(error);
  }
}
```

### 1.3 ClassLocker の実装

`src/objects/ClassLocker.ts` には以下の機能が実装されています：

- クラス（レッスン）予約のためのロック機構
- 予約処理の同時実行制御
- ロックの取得、確認、解除機能

```typescript
// ロック取得の例
private async lockClass(classId: string): Promise<Response> {
  if (this.locks.get(classId)) {
    return new Response(
      JSON.stringify({ locked: true, message: "Class is already locked" }),
      { status: 409 }
    );
  }
  
  this.locks.set(classId, true);
  return new Response(
    JSON.stringify({ locked: true, message: "Class locked successfully" }),
    { status: 200 }
  );
}
```

### 1.4 アクセス用ユーティリティ

- `src/lib/db-client.ts`: DatabaseDOへのアクセスユーティリティ
- `src/lib/do-client.ts`: Durable Objectsの共通アクセス処理

### 1.5 APIエンドポイント

- `src/features/*/routes/index.ts`: 各リソース（gyms, members, classes, bookings）のRESTful APIエンドポイント
- Honoフレームワークを使用したルーティング
- Auth0によるアクセス制御

## 2. 動作確認方法

実装した機能を確認するための手順は以下の通りです：

### 2.1 ローカル開発環境のセットアップ

1. D1データベースの作成

```bash
# D1データベースの作成
npx wrangler d1 create kime_mvp

# 作成されたデータベースIDをwrangler.tomlに追加
# [[d1_databases]]セクションのdatabase_idに設定
```

2. マイグレーションの実行

```bash
# マイグレーションファイルの作成
npx wrangler d1 migrations create kime_mvp initial_schema

# マイグレーションの適用
npx wrangler d1 migrations apply kime_mvp
```

3. ローカル開発サーバーの起動

```bash
# 開発サーバーの起動
npx wrangler dev --local
```

### 2.2 APIエンドポイントの確認

以下のAPIエンドポイントを順に確認することで、実装した機能が正しく動作することを確認できます。

#### ジム管理API

```bash
# ジム一覧の取得
curl http://localhost:8787/api/gyms

# 特定のジムの取得
curl http://localhost:8787/api/gyms/{gymId}

# 新規ジムの登録
curl -X POST http://localhost:8787/api/gyms \
  -H "Content-Type: application/json" \
  -d '{"name": "サンプルジム"}'
```

#### 会員管理API

```bash
# 会員一覧の取得
curl http://localhost:8787/api/members

# 特定の会員の取得
curl http://localhost:8787/api/members/{memberId}

# 新規会員の登録
curl -X POST http://localhost:8787/api/members \
  -H "Content-Type: application/json" \
  -d '{"name": "山田太郎", "email": "yamada@example.com", "gymId": "gym_123"}'
```

#### クラス管理API

```bash
# クラス一覧の取得
curl http://localhost:8787/api/classes

# 特定のクラスの取得
curl http://localhost:8787/api/classes/{classId}

# 新規クラスの登録
curl -X POST http://localhost:8787/api/classes \
  -H "Content-Type: application/json" \
  -d '{"name": "ヨガ初級", "gymId": "gym_123", "startTime": "2023-05-01T10:00:00Z", "endTime": "2023-05-01T11:00:00Z", "capacity": 20}'
```

#### 予約管理API（トランザクション処理の確認）

```bash
# 予約一覧の取得
curl http://localhost:8787/api/bookings

# 特定の予約の取得
curl http://localhost:8787/api/bookings/{bookingId}

# 新規予約の登録（トランザクション処理の確認）
curl -X POST http://localhost:8787/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"classId": "class_123", "memberId": "member_456", "gymId": "gym_123"}'
```

### 2.3 トランザクション処理の確認

予約処理のトランザクション確認には、同時に複数の予約リクエストを送信して、整合性が保たれることを確認します。以下のスクリプトを使用して確認できます：

```bash
#!/bin/bash

# 同時に10個の予約リクエストを送信
for i in {1..10}
do
  curl -X POST http://localhost:8787/api/bookings \
    -H "Content-Type: application/json" \
    -d '{"classId": "class_123", "memberId": "member_'$i'", "gymId": "gym_123"}' &
done

wait

# 予約状況を確認
curl http://localhost:8787/api/classes/class_123/bookings
```

### 2.4 本番環境へのデプロイ

1. Cloudflareへのデプロイ

```bash
# 本番環境へのデプロイ
npx wrangler deploy
```

2. D1データベースの本番環境設定

```bash
# 本番環境用のD1マイグレーションの適用
npx wrangler d1 migrations apply kime_mvp --production
```

## 3. トラブルシューティング

### 3.1 よくあるエラーと解決方法

- **Durable Objectが見つからないエラー**
  - `wrangler.toml`の設定を確認し、`class_name`が正しいか確認
  - `src/index.tsx`でDurable Objectが正しくエクスポートされているか確認

- **D1データベース接続エラー**
  - D1のバインディング設定を確認
  - wranglerコマンドでD1データベースが作成されているか確認

- **API呼び出しエラー**
  - リクエストのJSONフォーマットが正しいか確認
  - 適切なHTTPメソッド（GET, POST, PUT, DELETE）を使用しているか確認

### 3.2 デバッグ方法

- ローカル開発サーバーのログを確認
- `console.log`を使用した動作確認
- Cloudflareダッシュボードでの動作ログの確認

## 4. 今後の拡張ポイント

- 監視とアラートの設定（Cloudflare Analyticsの活用）
- バッチ処理のための定期実行Worker
- パフォーマンス最適化
- テスト環境の整備
- CI/CDパイプラインの構築

## 5. 参考リソース

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [Durable Objects ドキュメント](https://developers.cloudflare.com/workers/learning/using-durable-objects/)
- [D1 データベース ドキュメント](https://developers.cloudflare.com/d1/)
- [Hono フレームワーク ドキュメント](https://hono.dev/)
- [Drizzle ORM ドキュメント](https://orm.drizzle.team/)
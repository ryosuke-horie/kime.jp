1. **プロジェクト初期化**  
   1.1 Hono プロジェクトの作成  
   1.2 Wrangler (Cloudflare Workers CLI) の設定  

2. **Durable Objects（DO）準備**  
   2.1 DO クラスの定義  
   2.2 `wrangler.toml` へのバインディング設定  

3. **Drizzle ORM の導入**  
   3.1 パッケージのインストール  
   3.2 Drizzle 用クライアントの作成  

4. **スキーマ定義**  
   4.1 `schema.ts` にテーブル／モデルを定義  
   4.2 型のエクスポート  

5. **DO 上での Database インスタンス化**  
   5.1 DO コンストラクタ内で Drizzle インスタンス初期化  
   5.2 永続化ロジックの実装  

6. **Hono ルーティング実装**  
   6.1 DI で DO を注入  
   6.2 CRUD ハンドラーの作成  

7. **テスト＆ローカル動作確認**  
   7.1 `wrangler dev` で起動  
   7.2 Postman／curl によるエンドポイント検証  

8. **デプロイ**  
   8.1 `wrangler publish`  
   8.2 動作確認  

---

## 1. プロジェクト初期化

- **Hono のインストール**  
  ```bash
  npm init hono@latest
  cd your-project
  npm install
  ```
- **Wrangler の設定**  
  ```bash
  npm install -D wrangler
  ```
  `wrangler.toml` を作成し、アカウントID・名前空間などを設定します。

---

## 2. Durable Objects（DO）準備

- **DO クラス定義**  
  ```ts
  // src/objects/MyDatabase.ts
  export class MyDatabase {
    constructor(private state: DurableObjectState) {}
    // ここにデータ永続化用メソッドを実装
  }
  ```
- **バインディング設定**  
  ```toml
  # wrangler.toml
  [[ durable_objects ]]
  class_name = "MyDatabase"
  binding = "MY_DB_DO"
  ```

---

## 3. Drizzle ORM の導入

- **パッケージインストール**  
  ```bash
  npm install drizzle-orm drizzle-orm-cloudflare
  ```
- **Drizzle クライアントの準備**  
  ```ts
  // src/db/client.ts
  import { drizzle } from "drizzle-orm/cloudflare";
  import { MyDatabase } from "../objects/MyDatabase";

  export function createDb(state: DurableObjectState) {
    const rawStorage = state.storage;
    return drizzle(rawStorage, { /* オプション */ });
  }
  ```

---

## 4. スキーマ定義

- **`schema.ts` でモデル定義**  
  ```ts
  // src/db/schema.ts
  import { pgTable, serial, text, timestamp } from "drizzle-orm";

  export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: text("name"),
    created_at: timestamp("created_at").defaultNow(),
  });
  ```
- **型エクスポート**  
  ```ts
  export type User = InferModel<typeof users>;
  ```

---

## 5. DO 上での Database インスタンス化

- **DO のコンストラクタ内で初期化**  
  ```ts
  // src/objects/MyDatabase.ts
  import { createDb } from "../db/client";

  export class MyDatabase {
    private db = createDb(this.state);

    async fetch(request: Request) {
      // this.db を使ったクエリ実行
    }
  }
  ```
- **永続化メソッド例**  
  ```ts
  await this.state.storage.put("lastSync", Date.now());
  ```

---

## 6. Hono ルーティング実装

- **DO バインディングの注入**  
  ```ts
  import { Hono } from "hono";

  const app = new Hono();

  app.route("/api/users", async (c) => {
    const stub = c.env.MY_DB_DO.idFromName("users");
    const obj = c.env.MY_DB_DO.get(stub);
    return obj.fetch(c.req);
  });
  ```
- **CRUD ハンドラー**  
  - `GET /api/users` → 全件取得  
  - `POST /api/users` → 新規作成  
  - `PUT /api/users/:id` → 更新  
  - `DELETE /api/users/:id` → 削除  

---

## 7. テスト＆ローカル動作確認

1. `npm run dev` または `wrangler dev` でローカル起動  
2. `curl http://localhost:8787/api/users` などで動作検証  

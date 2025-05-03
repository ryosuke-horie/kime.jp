# ADR-006 — OpenAPI + Zod による型安全なAPI基盤構築

---

## 1. 背景

APIベースのアプリケーション開発において、以下の課題が存在していました：

- フロントエンドとバックエンドの型定義の不一致
- APIリクエスト/レスポンスの検証ロジックの重複
- API仕様ドキュメントの管理と同期の煩雑さ
- 統一されたエラーハンドリングの欠如

これらの課題を解決し、型安全かつメンテナンス性の高いAPI基盤を構築するため、OpenAPIとZodを統合した設計が必要とされました。

---

## 2. 決定

### 2.1 全体アーキテクチャ

以下の構成で型安全なAPI基盤を構築します：

1. **Zodスキーマ定義**: リクエスト/レスポンス構造の単一ソースとなるZodスキーマを定義
2. **OpenAPI自動生成**: ZodスキーマからOpenAPI仕様を自動生成
3. **Swagger UI統合**: APIドキュメントの自動生成と公開
4. **型安全なAPI層**: Honoミドルウェアを使用したリクエスト/レスポンスのバリデーション
5. **共有型パッケージ**: フロントエンドとバックエンド間で型定義を共有する`@kime/api-types`パッケージの作成
6. **型安全なAPIクライアント**: 自動生成された型を使用するAPIクライアントの実装

### 2.2 コンポーネント構成

| コンポーネント | 実装技術 | 役割 |
|--------------|-----------|------|
| スキーマ定義 | **Zod** | 型と検証ルールの単一ソース定義 |
| OpenAPI変換 | **zod-to-openapi** | ZodスキーマからOpenAPI仕様への変換 |
| API文書化 | **@hono/swagger-ui** | Hono上でのSwagger UI提供 |
| バリデーション | **@hono/zod-validator** | APIリクエスト/レスポンスの検証 |
| 共有型パッケージ | **@kime/api-types** | 型定義の共有モジュール |
| APIクライアント | **@kime/api-client** | 型安全なAPIクライアントとReact Hooks |

### 2.3 ディレクトリ構造

```
apps/workers/
├─ src/
│  ├─ schemas/
│  │   ├─ openapi/
│  │   │   ├─ config.ts      ← OpenAPIレジストリと設定
│  │   │   └─ document.ts    ← OpenAPIドキュメント生成
│  │   ├─ models/            ← モデル別Zodスキーマ定義
│  │   │   ├─ common.ts      ← 共通スキーマ（エラー等）
│  │   │   ├─ gym.ts         ← ジム関連スキーマ
│  │   │   └─ health.ts      ← ヘルスチェックスキーマ
│  ├─ utils/
│  │   └─ validator.ts       ← Zodバリデーションユーティリティ
│  └─ index.tsx              ← Swagger UI統合エントリポイント

packages/
├─ api-types/                ← 共有型定義パッケージ
│  ├─ src/
│  │   ├─ index.ts           ← エントリポイント
│  │   ├─ common.ts          ← 共通型定義
│  │   ├─ gym.ts             ← ジム関連型定義
│  │   └─ health.ts          ← ヘルスチェック型定義
│  └─ package.json
│
└─ api-client/               ← 型安全なAPIクライアント
   ├─ src/
   │   ├─ index.ts           ← エントリポイント
   │   ├─ client.ts          ← 基本APIクライアント実装
   │   └─ hooks.ts           ← React Hooks実装サンプル
   └─ package.json
```

### 2.4 実装フロー

1. Zodスキーマ定義 → OpenAPIレジストリへの登録
2. OpenAPIドキュメント生成 → Swagger UI提供
3. APIエンドポイント実装 → Zodバリデーション適用
4. 共有型パッケージ構築 → フロントエンドでの型利用
5. 型安全なAPIクライアント実装

### 2.5 主要コンポーネントの詳細

#### Zodスキーマとレジストリ設定

```typescript
// src/schemas/openapi/config.ts
import { OpenAPIRegistry } from "zod-to-openapi";

// OpenAPIのレジストリを作成
export const registry = new OpenAPIRegistry();

// API情報の共通設定
export const apiInfo = {
  title: "Kime API",
  version: "1.0.0",
  description: "格闘技ジム向けAI予約・フォローアップシステムのAPI",
};
```

#### OpenAPIドキュメント生成

```typescript
// src/schemas/openapi/document.ts
import { OpenAPIGenerator } from "zod-to-openapi";
import { registry, apiInfo, servers, tags, securitySchemes } from "./config";

export function generateOpenApiDocument() {
  const generator = new OpenAPIGenerator(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: apiInfo,
    servers,
    security: [{ apiKey: [] }],
    tags,
    components: {
      securitySchemes,
    },
  });
}
```

#### モデルスキーマの例

```typescript
// src/schemas/models/common.ts
import { z } from "zod";
import { registry } from "../openapi/config";

// 共通のエラーレスポンス型
export const ErrorResponse = z.object({
  error: z.string().describe("エラーメッセージ"),
  details: z.array(
    z.object({
      path: z.string().describe("エラーが発生したパス"),
      message: z.string().describe("詳細なエラーメッセージ"),
    })
  ).optional().describe("バリデーションエラーの詳細情報"),
});

// OpenAPIスキーマに登録
registry.register("ErrorResponse", ErrorResponse);
```

#### バリデーションユーティリティ

```typescript
// src/utils/validator.ts
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const validateBody = <T extends z.ZodTypeAny>(schema: T) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "バリデーションエラー",
          details: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        400,
      );
    }
  });
```

#### Swagger UI統合

```typescript
// src/index.tsx
import { swaggerUI } from "@hono/swagger-ui";
import { openApiDocument } from "./schemas/openapi/document";

// Swagger UIを追加
app.get(
  "/docs",
  swaggerUI({
    url: "/api-docs",
    title: "Kime API ドキュメント",
  }),
);

// OpenAPIドキュメントを提供するエンドポイント
app.get("/api-docs", (c) => {
  return c.json(openApiDocument);
});
```

---

## 3. 結果と影響

### 正の効果

1. **型安全性の向上**:
   - フロントエンドとバックエンドで型定義の一貫性を確保
   - コンパイル時の型エラー検知により開発効率向上

2. **ドキュメント自動生成**:
   - コードからドキュメントが自動生成されるため常に最新状態を維持
   - Swagger UIによる対話的なAPIドキュメントの提供

3. **バリデーション一元化**:
   - 単一ソースの真実（Zodスキーマ）によりバリデーションロジックの重複を排除
   - 統一されたエラーハンドリングとレスポンス形式

4. **開発効率の向上**:
   - TypeScriptの型補完によるAPIの使いやすさ向上
   - 型安全なAPIクライアントによるミスの防止
   - Hono + zValidator によるシンプルかつ効率的な実装

### 負の効果 / トレードオフ

1. **初期設定の複雑さ**:
   - OpenAPI + Zod + Hono の統合には初期設定の手間が必要
   - 適切なディレクトリ構造と型定義の設計が求められる

2. **ビルド時間への影響**:
   - 型生成とバリデーションによりビルド時間がやや増加
   - パッケージ間の依存関係の管理が必要

3. **学習コスト**:
   - 新たな開発者へのZod、OpenAPI、Honoの学習コスト
   - スキーマ定義と型生成の流れを理解する必要がある

---

## 4. 検討したが採用しなかった案

| 代替案 | 理由 |
|---------|------|
| **OpenAPI仕様を直接記述** | Zodに比べ冗長で、バリデーションロジックと分離するため二重管理が必要 |
| **GraphQL** | REST APIの単純さとCloudfareWorkersとの親和性を優先。リソース制約も考慮 |
| **API仕様からコード生成** | 既存コードベースとの統合が難しく、生成コードの品質とカスタマイズ性に懸念 |
| **RPC形式API (tRPC等)** | RESTful設計の方がAPI公開性と拡張性において優れており、OpenAPIドキュメントの恩恵を得られる |

---

## 5. 次のステップと発展

1. **自動テスト拡充**:
   - スキーマに基づく自動テスト生成
   - 契約テストの導入

2. **バージョニング対応**:
   - API バージョニング戦略の実装
   - 後方互換性の維持方法の確立

3. **モニタリングと分析**:
   - OpenAPIに基づくAPIメトリクス収集
   - 型情報を活用した高度なロギング

4. **コード生成の拡充**:
   - より多様なクライアント言語への対応
   - モックサーバーの自動生成

---

## 6. 決定履歴

* **2025-05-04** — OpenAPI + Zod統合の設計と実装を承認。Issue #98の対応として実装。
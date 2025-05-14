# Cloudflare Workers と D1 データベースのテスト戦略

## 概要

このドキュメントでは、Cloudflare Workers と D1 データベースを使用したアプリケーションのテスト戦略について説明します。特に以下の点に焦点を当てています：

- ローカル D1 データベースを利用した統合テスト
- モックを活用した単体テスト
- テストファイルの配置戦略
- 推奨ライブラリとツール

## テスト戦略の基本方針

1. **テストピラミッドの採用**
   - 単体テスト（多数）: コンポーネントの個別機能テスト
   - 統合テスト（中程度）: コンポーネント間の連携テスト
   - E2Eテスト（少数）: エンドツーエンドの機能テスト

2. **テストファイルの配置**
   - テストコードは実装コードの近くに配置する
   - 実装ファイルと同じディレクトリ内に `*.test.ts` として配置

3. **環境分離**
   - 開発環境とテスト環境を明確に分離
   - テスト用の D1 データベースを用意

## 単体テスト (Unit Tests)

### 対象コンポーネント

- サービス層 (`*-service.ts`)
- リポジトリ層 (`*-repository.ts`)
- コントローラー層 (`*-controller.ts`)
- ユーティリティ関数

### テスト手法

1. **モックの活用**
   - 依存関係をモックしてコンポーネントを分離
   - D1 データベースのモック化

2. **推奨ライブラリ**
   - **Vitest**: メインのテストランナー
   - **vi**: Vitest 組み込みのモックライブラリ
   - **@miniflare/d1**: D1 データベースのモック

### 単体テスト実装例

```typescript
// gym-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GymService } from './gym-service';

describe('GymService', () => {
  let gymService: GymService;
  let mockRepository: any;

  beforeEach(() => {
    // リポジトリのモック作成
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      // 他のメソッド
    };

    gymService = new GymService(mockRepository);
  });

  describe('getGyms', () => {
    it('should return gyms with pagination', async () => {
      // モックの戻り値を設定
      mockRepository.findAll.mockResolvedValue({
        items: [{ id: '1', name: 'Test Gym' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 }
      });

      // テスト対象メソッド実行
      const result = await gymService.getGyms({});

      // 検証
      expect(mockRepository.findAll).toHaveBeenCalledWith({});
      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    // 他のテストケース
  });
});
```

## 統合テスト (Integration Tests)

### 対象範囲

- APIエンドポイント全体の機能
- データベース操作を含むフロー
- ミドルウェアとハンドラーの連携

### テスト手法

1. **ローカル D1 データベース**
   - Miniflare を使用したローカル D1 インスタンス
   - テスト用のスキーマとシードデータ

2. **APIリクエストのシミュレーション**
   - Hono のテストユーティリティを活用
   - エンドツーエンドのリクエスト/レスポンスフロー

3. **推奨ライブラリ**
   - **Miniflare**: Cloudflare Workers のローカルシミュレーション
   - **@miniflare/d1**: D1 データベースのローカル実装
   - **Hono/testing**: Hono アプリケーションのテストユーティリティ

### 統合テスト実装例

```typescript
// api/gyms/index.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Miniflare } from 'miniflare';
import { app } from '../../index';

describe('GET /api/gyms', () => {
  let miniflare: Miniflare;
  let d1: D1Database;

  beforeAll(async () => {
    // Miniflare と D1 のセットアップ
    miniflare = new Miniflare({
      modules: true,
      d1Databases: ['DB'],
      d1Persist: true, // オプション: データの永続化
    });

    d1 = await miniflare.getD1Database('DB');
    
    // マイグレーションの適用
    await d1.exec(`
      CREATE TABLE IF NOT EXISTS gyms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        owner_email TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
  });

  beforeEach(async () => {
    // テストデータのクリーンアップと再設定
    await d1.exec('DELETE FROM gyms');
    await d1.exec(`
      INSERT INTO gyms (id, name, owner_email, created_at, updated_at)
      VALUES 
        ('1', 'Test Gym 1', 'owner1@example.com', 1620000000, 1620000000),
        ('2', 'Test Gym 2', 'owner2@example.com', 1620100000, 1620100000)
    `);
  });

  afterAll(async () => {
    // クリーンアップ
    await d1.exec('DROP TABLE IF EXISTS gyms');
  });

  it('should return all gyms with default pagination', async () => {
    // テスト用の環境を作成
    const env = { DB: d1 };
    const res = await app.fetch(new Request('http://localhost/api/gyms'), env);
    const data = await res.json();

    // レスポンスの検証
    expect(res.status).toBe(200);
    expect(data.items).toHaveLength(2);
    expect(data.meta.total).toBe(2);
  });

  it('should filter gyms by search parameter', async () => {
    const env = { DB: d1 };
    const res = await app.fetch(
      new Request('http://localhost/api/gyms?search=Gym 1'), 
      env
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.items).toHaveLength(1);
    expect(data.items[0].name).toBe('Test Gym 1');
  });

  // 他のテストケース（ソート、ページネーションなど）
});
```

## ライブラリの設定と導入

### 必要なライブラリ

```bash
# メインのテストツール
pnpm add -D vitest

# Cloudflare Workers テスト用
pnpm add -D miniflare @miniflare/d1

# Hono テスト用（既存であれば不要）
pnpm add -D @hono/testing
```

### Vitest の設定

`vitest.config.ts` の設定例：

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'miniflare',
    environmentOptions: {
      modules: true,
      d1Databases: ['DB'],
      d1Persist: false,
    },
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 10000, // CloudflareとD1のテストは時間がかかることがある
  },
});
```

### テストセットアップファイル

`src/test/setup.ts` の例：

```typescript
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { Miniflare } from 'miniflare';
import { drizzle } from 'drizzle-orm/d1';
import { migrate } from 'drizzle-orm/d1/migrator';

let miniflare: Miniflare;
let d1: D1Database;

beforeAll(async () => {
  miniflare = new Miniflare({
    modules: true,
    d1Databases: ['DB'],
    d1Persist: true,
  });
  
  d1 = await miniflare.getD1Database('DB');
  
  // Drizzleマイグレーションの適用
  const db = drizzle(d1);
  await migrate(db, { migrationsFolder: './migrations' });
  
  // グローバル変数として設定
  globalThis.testDb = d1;
});

beforeEach(async () => {
  // 各テスト前にデータをクリーンアップする方法
  // テーブルのリストを取得して各テーブルをクリア
  const tables = await d1.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  ).all();
  
  for (const { name } of tables.results) {
    await d1.exec(`DELETE FROM ${name}`);
  }
});

afterAll(async () => {
  // クリーンアップコード（必要に応じて）
});
```

## CI/CD パイプラインへの統合

GitHub Actions での設定例：

```yaml
name: Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run linter
        run: pnpm lint
        
      - name: Run tests
        run: pnpm test
```

## ベストプラクティス

1. **テストファイルの配置**
   - 実装ファイルと同じディレクトリに配置
   - 命名規則: `original-file.test.ts`

2. **テストデータ管理**
   - テストフィクスチャ（テストデータ）は `src/test/fixtures` に配置
   - 共通のテストヘルパーは `src/test/helpers` に配置

3. **テストカバレッジ**
   - 重要なビジネスロジックには高いカバレッジを目指す
   - リポジトリ層のテストは DB 操作の正確性を確認

4. **テスト分離**
   - 単体テストはすべての依存関係をモック化
   - 統合テストはローカル D1 を使用し実際のデータフローをテスト

## サンプルディレクトリ構造

```
src/
├── controllers/
│   ├── gym-controller.ts
│   └── gym-controller.test.ts
├── services/
│   ├── gym-service.ts
│   └── gym-service.test.ts
├── repositories/
│   ├── gym-repository.ts
│   └── gym-repository.test.ts
├── routes/
│   └── api/
│       └── gyms/
│           ├── index.ts
│           └── index.test.ts
├── test/
│   ├── setup.ts
│   ├── fixtures/
│   │   └── gyms.ts
│   └── helpers/
│       └── test-utilities.ts
└── index.ts
```

## 結論

Cloudflare Workers と D1 データベースのテスト戦略は、以下の要素を組み合わせることで効果的に実装できます：

1. **単体テスト**：モックを使用して個々のコンポーネントを分離テスト
2. **統合テスト**：Miniflare と D1 ローカルインスタンスを使用して実際のデータフローをテスト
3. **テストファイル配置**：実装コードの近くにテストファイルを配置
4. **CI/CD 統合**：自動テスト実行によるコード品質の維持

これらの戦略を採用することで、アプリケーションの信頼性を高め、バグを早期に発見し、安全なリファクタリングを可能にします。
# テスト戦略とVitest導入ガイド

## 概要

本ドキュメントは、Kimeプロジェクトにおけるテスト戦略とVitest導入について説明します。特に、Cloudflare Workers環境でのAPIテスト方法と、モノレポ構造におけるテスト設定について詳細に解説します。

## 目次

1. [テスト戦略](#テスト戦略)
2. [Vitest導入手順](#vitest導入手順)
3. [Workers APIのテスト方法](#workers-apiのテスト方法)
4. [Durable Objectsのテスト](#durable-objectsのテスト)
5. [モノレポでのテスト設定共通化](#モノレポでのテスト設定共通化)
6. [CI/CDへの統合](#cicdへの統合)
7. [TDDワークフロー](#tddワークフロー)

## テスト戦略

### テストの種類

1. **ユニットテスト**
   - 個別の関数やユーティリティのテスト
   - 外部依存はすべてモック化
   - 高速で独立した実行

2. **統合テスト**
   - APIエンドポイントの機能テスト
   - 複数コンポーネントの連携テスト
   - Durable Objectsとの連携検証

3. **E2Eテスト**（将来的に実装）
   - 実際のユーザーフローをシミュレート
   - フロントエンドとバックエンドの連携検証

### テストカバレッジ目標

- ユニットテスト: 80%以上
- 統合テスト: 主要APIエンドポイントの全カバー
- 重要なビジネスロジック: 100%

## Vitest導入手順

### 1. パッケージインストール

```bash
# ルートディレクトリで実行
pnpm add -D vitest @cloudflare/vitest-pool-workers @vitest/coverage-v8
```

### 2. ワークスペース設定

ルートディレクトリに `vitest.workspace.ts` を作成:

```typescript
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'apps/*/vitest.config.{js,ts}',
])
```

### 3. Workers用テスト設定

`apps/workers/vitest.config.ts` を作成:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    pool: '@cloudflare/vitest-pool-workers',
    poolOptions: {
      workers: {
        wrangler: {
          configPath: './wrangler.toml'
        }
      }
    },
    environment: 'miniflare',
    testTimeout: 10000,
    hookTimeout: 10000,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  }
})
```

### 4. Web用テスト設定（Next.js）

`apps/web/vitest.config.ts` を作成:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  }
})
```

### 5. package.jsonの更新

各アプリのpackage.jsonにテストスクリプトを追加:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

ルートのpackage.jsonにもテストスクリプトを追加:

```json
{
  "scripts": {
    "test": "turbo run test"
  }
}
```

### 6. Turbo設定の更新

`turbo.json` にテストパイプラインを追加:

```json
{
  "pipeline": {
    "test": {
      "outputs": []
    }
  }
}
```

## Workers APIのテスト方法

### 基本的なAPIエンドポイントテスト

`apps/workers/src/features/gyms/routes/index.test.ts` の例:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { Hono } from 'hono'
import { gymRouter } from './index'

describe('Gym Router', () => {
  // モック環境の準備
  const mockEnv = {
    DB_DO: {
      idFromName: vi.fn().mockReturnValue('test-id'),
      get: vi.fn().mockReturnValue({
        fetch: vi.fn().mockImplementation(async () => {
          return new Response(JSON.stringify({
            success: true,
            data: [{ id: 'gym1', name: 'Test Gym' }]
          }))
        })
      })
    }
  }

  it('GET /gyms/:gymId should return gym details', async () => {
    // テスト用アプリ作成
    const app = new Hono()
    app.route('/gyms', gymRouter)

    // リクエスト実行
    const res = await app.request('/gyms/gym1', {
      method: 'GET',
      env: mockEnv
    })

    // レスポンス検証
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('gym')
    expect(data.gym).toHaveProperty('id', 'gym1')
  })
})
```

### リクエストとレスポンスのテスト

```typescript
it('POST /gyms/admin should create a new gym', async () => {
  const app = new Hono()
  app.route('/gyms', gymRouter)

  // モックの設定
  mockEnv.DB_DO.get.mockReturnValue({
    fetch: vi.fn().mockImplementation(async () => {
      return new Response(JSON.stringify({
        success: true,
        id: 'new-gym-id'
      }))
    })
  })

  // リクエスト実行
  const res = await app.request('/gyms/admin', {
    method: 'POST',
    env: mockEnv,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'New Gym',
      ownerEmail: 'owner@example.com'
    })
  })

  // レスポンス検証
  expect(res.status).toBe(201)
  const data = await res.json()
  expect(data).toHaveProperty('gymId', 'new-gym-id')
})
```

## Durable Objectsのテスト

### DOクライアントのモック化

```typescript
import { getDatabaseClient } from '../../../lib/do-client'

// DOクライアントのモック
vi.mock('../../../lib/do-client', () => ({
  getDatabaseClient: vi.fn().mockImplementation(() => ({
    getOne: vi.fn().mockResolvedValue({
      success: true,
      data: { id: 'test-id', name: 'Test Item' }
    }),
    list: vi.fn().mockResolvedValue({
      success: true,
      data: [{ id: 'item1' }, { id: 'item2' }]
    }),
    create: vi.fn().mockResolvedValue({
      success: true,
      id: 'new-id'
    }),
    update: vi.fn().mockResolvedValue({
      success: true
    }),
    delete: vi.fn().mockResolvedValue({
      success: true
    })
  }))
}))
```

### Cloudflare環境のモック化

```typescript
const createMockEnv = () => {
  return {
    DB_DO: {
      idFromName: vi.fn().mockReturnValue('test-id'),
      get: vi.fn().mockReturnValue({
        fetch: vi.fn().mockImplementation(async (url) => {
          // URLに基づいてレスポンスを分岐
          const urlObj = new URL(url)
          const path = urlObj.pathname
          
          if (path.includes('/get/')) {
            return new Response(JSON.stringify({
              success: true,
              data: { id: 'test-id', name: 'Test Item' }
            }))
          }
          
          if (path.includes('/list/')) {
            return new Response(JSON.stringify({
              success: true,
              data: [{ id: 'item1' }, { id: 'item2' }]
            }))
          }
          
          // その他のケース...
          
          return new Response(JSON.stringify({
            success: false,
            error: 'Not implemented in mock'
          }), { status: 500 })
        })
      })
    },
    CLASS_LOCKER: {
      // 同様にモック実装
    }
  }
}
```

## モノレポでのテスト設定共通化

### 共通設定ファイル

`packages/testing-utils/vitest.shared.ts` の例:

```typescript
import { mergeConfig } from 'vitest/config'
import type { ConfigEnv, UserConfig } from 'vitest/config'

export const defineSharedConfig = (config: UserConfig, env: ConfigEnv) => {
  return mergeConfig({
    test: {
      globals: true,
      environment: 'node',
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['**/node_modules/**', '**/test/**']
      }
    }
  }, config)
}
```

### 共通モックユーティリティ

`packages/testing-utils/mocks/cloudflare.ts` の例:

```typescript
import { vi } from 'vitest'

export const createCloudflareEnvMock = (customMocks = {}) => {
  return {
    DB_DO: {
      idFromName: vi.fn().mockReturnValue('test-id'),
      get: vi.fn().mockReturnValue({
        fetch: vi.fn().mockImplementation(async () => {
          return new Response(JSON.stringify({
            success: true,
            data: {}
          }))
        })
      })
    },
    CLASS_LOCKER: {
      idFromName: vi.fn().mockReturnValue('test-id'),
      get: vi.fn().mockReturnValue({
        fetch: vi.fn().mockImplementation(async () => {
          return new Response(JSON.stringify({
            success: true
          }))
        })
      })
    },
    ...customMocks
  }
}
```

## CI/CDへの統合

### GitHub Actionsワークフロー例

```yaml
name: Tests

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
          node-version: '20'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10.9.0
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run tests
        run: pnpm test
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## TDDワークフロー

TDD（テスト駆動開発）で新機能を開発する基本的なワークフロー:

1. **テストの作成**:
   - 新機能の要件を理解
   - 期待される動作を定義するテストを作成
   - この時点ではテストは失敗する（Red）

2. **実装**:
   - テストを通過するための最小限の実装を行う
   - テストが通過することを確認（Green）

3. **リファクタリング**:
   - コードの品質を改善
   - テストが引き続き通過することを確認

### 例: 新しいAPIエンドポイント開発

```typescript
// 1. テスト作成 (Red)
describe('Instructor API', () => {
  it('GET /instructors/:id should return instructor details', async () => {
    const app = new Hono()
    app.route('/instructors', instructorRouter)
    
    const res = await app.request('/instructors/instructor1', {
      method: 'GET',
      env: mockEnv
    })
    
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('instructor')
    expect(data.instructor).toHaveProperty('id', 'instructor1')
  })
})

// 2. 実装 (Green)
// instructorRouter.ts に実装を追加

// 3. リファクタリング
// コードをきれいにしつつテストが通ることを確認
```

---

## 参考リンク

- [Vitest公式ドキュメント](https://vitest.dev/)
- [Cloudflare Workers Testing](https://developers.cloudflare.com/workers/testing/)
- [Hono Testing Utilities](https://hono.dev)
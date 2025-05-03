# TDD実践ガイド

## 概要

本ドキュメントでは、Kimeプロジェクトにおけるテスト駆動開発（TDD）の実践方法について説明します。特にCloudflare Workers環境でのHono APIエンドポイント開発を中心に、TDDのワークフローと実践的な例を提供します。

## 目次

1. [TDDの基本原則](#tddの基本原則)
2. [TDDサイクル](#tddサイクル)
3. [Workers APIのTDD](#workers-apiのtdd)
4. [モックの効果的な使用](#モックの効果的な使用)
5. [TDDの実践例](#tddの実践例)
6. [よくある課題と解決策](#よくある課題と解決策)

## TDDの基本原則

テスト駆動開発（TDD）は以下の原則に基づいています：

1. **テストファースト**：実装前にテストを書く
2. **小さなステップ**：小さな変更を繰り返し行う
3. **継続的フィードバック**：テストを頻繁に実行して即座にフィードバックを得る
4. **リファクタリング**：テストが通った後にコードの品質を向上させる

## TDDサイクル

TDDは「Red-Green-Refactor」のサイクルで進行します：

1. **Red**：失敗するテストを書く
2. **Green**：テストが通るコードを書く（品質よりも動作を優先）
3. **Refactor**：テストが通ることを確認しながらコードをリファクタリングする

![TDDサイクル](https://via.placeholder.com/500x300?text=TDD+サイクル図)

## Workers APIのTDD

### 基本的なワークフロー

1. **テスト環境のセットアップ**：
   - Vitestとテスト関連の依存関係をインストール
   - テスト構成ファイルを作成（vitest.config.ts）

2. **APIエンドポイントのテスト作成**：
   - テストファイルを作成（例：`src/features/instructors/routes/index.test.ts`）
   - Honoアプリとルーターをセットアップ
   - リクエストとレスポンスのアサーションを定義

3. **実装**：
   - テストが通るように最小限の実装を行う
   - エンドポイントの処理ロジックを作成

4. **リファクタリング**：
   - コードの品質を向上させる
   - ビジネスロジックの抽出
   - エラーハンドリングの追加

### テストファイルの構造

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Hono } from 'hono'
import { instructorRouter } from './index'  // まだ実装されていない

describe('Instructor Router', () => {
  let app: Hono
  let mockEnv: any

  beforeEach(() => {
    // テスト前の準備
    app = new Hono()
    app.route('/instructors', instructorRouter)
    
    // 環境のモック
    mockEnv = {
      DB_DO: {
        idFromName: vi.fn().mockReturnValue('test-id'),
        get: vi.fn().mockReturnValue({
          fetch: vi.fn().mockImplementation(async () => {
            return new Response(JSON.stringify({
              success: true,
              data: { id: 'instructor1', name: 'Test Instructor' }
            }))
          })
        })
      }
    }
  })

  it('GET /instructors/:id should return instructor details', async () => {
    const res = await app.request('/instructors/instructor1', {
      method: 'GET',
      env: mockEnv
    })
    
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('instructor')
    expect(data.instructor).toHaveProperty('id', 'instructor1')
    expect(data.instructor).toHaveProperty('name', 'Test Instructor')
  })

  // その他のテストケース...
})
```

## モックの効果的な使用

### DOクライアントのモック

```typescript
// src/lib/__mocks__/do-client.ts
import { vi } from 'vitest'

export const getDatabaseClient = vi.fn().mockImplementation(() => ({
  getOne: vi.fn().mockResolvedValue({
    success: true,
    data: { id: 'test-id', name: 'Test Item' }
  }),
  list: vi.fn().mockResolvedValue({
    success: true,
    data: [{ id: 'item1' }, { id: 'item2' }]
  }),
  // その他のメソッド...
}))
```

### バリデーションの失敗ケース

```typescript
it('POST /instructors should return 400 for invalid input', async () => {
  const res = await app.request('/instructors', {
    method: 'POST',
    env: mockEnv,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      // 必須フィールドを意図的に省略
    })
  })
  
  expect(res.status).toBe(400)
  const data = await res.json()
  expect(data).toHaveProperty('error')
})
```

## TDDの実践例

### 新しいAPIエンドポイントの開発

#### ステップ1: テストファイルの作成（Red）

```typescript
// src/features/classes/routes/attendance.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Hono } from 'hono'
import { attendanceRouter } from './attendance'  // まだ実装されていない

describe('Class Attendance Router', () => {
  // セットアップコード...

  it('POST /classes/:classId/attendance should mark attendance', async () => {
    const res = await app.request('/classes/class123/attendance', {
      method: 'POST',
      env: mockEnv,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        memberId: 'member456',
        status: 'present'
      })
    })
    
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data).toHaveProperty('message')
    expect(data).toHaveProperty('attendanceId')
  })
})
```

#### ステップ2: 最小限の実装（Green）

```typescript
// src/features/classes/routes/attendance.ts
import { Hono } from 'hono'
import type { Env } from '../../../env'
import { getDatabaseClient } from '../../../lib/do-client'

export const attendanceRouter = new Hono<{ Bindings: Env }>()

attendanceRouter.post('/:classId/attendance', async (c) => {
  const classId = c.req.param('classId')
  const data = await c.req.json()
  
  // 最小限の検証
  if (!data.memberId || !data.status) {
    return c.json({ error: '会員IDと出席ステータスは必須です' }, 400)
  }
  
  const dbClient = getDatabaseClient(c.env)
  const result = await dbClient.create('attendance', {
    classId,
    memberId: data.memberId,
    status: data.status,
    timestamp: new Date().toISOString()
  })
  
  if (!result.success) {
    return c.json({ error: result.error }, 500)
  }
  
  return c.json({
    message: '出席が記録されました',
    attendanceId: result.id
  }, 201)
})

export default attendanceRouter
```

#### ステップ3: リファクタリング

```typescript
// src/features/classes/routes/attendance.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { Env } from '../../../env'
import { getDatabaseClient } from '../../../lib/do-client'

// バリデーションスキーマの抽出
const attendanceSchema = z.object({
  memberId: z.string().min(1, '会員IDは必須です'),
  status: z.enum(['present', 'absent', 'late'], {
    required_error: '出席ステータスは必須です',
    invalid_type_error: '出席ステータスは present, absent, late のいずれかである必要があります'
  })
})

export const attendanceRouter = new Hono<{ Bindings: Env }>()

// ミドルウェアとしてバリデーションを追加
attendanceRouter.post(
  '/:classId/attendance',
  zValidator('json', attendanceSchema),
  async (c) => {
    const classId = c.req.param('classId')
    const data = c.req.valid('json')
    
    // データベース処理を関数に抽出
    const result = await recordAttendance(c.env, classId, data)
    
    if (!result.success) {
      return c.json({ error: result.error }, 500)
    }
    
    return c.json({
      message: '出席が記録されました',
      attendanceId: result.id
    }, 201)
  }
)

// ビジネスロジックの抽出
async function recordAttendance(env: Env, classId: string, data: z.infer<typeof attendanceSchema>) {
  const dbClient = getDatabaseClient(env)
  
  // クラスの存在確認
  const classCheck = await dbClient.getOne('classes', classId)
  if (!classCheck.success) {
    return { success: false, error: 'クラスが見つかりません' }
  }
  
  // 出席記録の作成
  return await dbClient.create('attendance', {
    classId,
    memberId: data.memberId,
    status: data.status,
    timestamp: new Date().toISOString()
  })
}

export default attendanceRouter
```

## よくある課題と解決策

### 1. テスト設計の難しさ

**課題**: 最初のテスト設計をどうするか迷う

**解決策**:
- ユーザーストーリーやユースケースから始める
- 最初はシンプルなケースからテストを書き始める
- 徐々に複雑なケースや例外ケースを追加していく

### 2. モックの複雑さ

**課題**: Durable ObjectsやCloudflare環境のモックが複雑になる

**解決策**:
- 再利用可能なモックファクトリを作成する
- テスト専用のユーティリティライブラリを構築する
- モックをカスタマイズ可能にして様々なテストケースに対応できるようにする

### 3. TDDの持続可能性

**課題**: 時間的プレッシャーでTDDを省略してしまう

**解決策**:
- TDDを習慣化する
- ペアプログラミングでTDDを実践する
- CIにテストカバレッジレポートを組み込む
- TDDの成功事例を共有する

## まとめ

TDDは初期投資は必要ですが、長期的には以下のメリットがあります：

- バグの早期発見と修正
- リファクタリングの安全性確保
- コードの品質向上
- ドキュメントとしてのテスト（機能理解の促進）
- 開発者の自信向上

Kimeプロジェクトでは、特にAPIエンドポイントの開発においてTDDを積極的に取り入れることで、高品質で保守性の高いコードベースを構築していきましょう。
# Cloudflare Workers テスト実行ガイド

このドキュメントでは、Cloudflare Workers プロジェクトにおけるテストの実行方法について説明します。

## 前提条件

- Node.js とpnpmがインストールされていること
- 必要なテスト関連パッケージがインストールされていること

```bash
# 必要なパッケージのインストール
pnpm add -D vitest miniflare @miniflare/d1 @hono/testing
```

## テストの実行

### すべてのテストを実行

プロジェクトのルートディレクトリで以下のコマンドを実行します：

```bash
# workersディレクトリのテストのみ実行
pnpm --filter=workers test

# または、monorepoの全テストを実行
pnpm test
```

### 特定のテストファイルを実行

特定のテストファイルのみを実行するには：

```bash
pnpm --filter=workers vitest run src/services/gym-service.test.ts
```

### ウォッチモードでテストを実行

開発中は、ファイルを変更するたびに自動的にテストを再実行するウォッチモードが便利です：

```bash
pnpm --filter=workers vitest watch
```

### テストカバレッジレポートを生成

テストのカバレッジレポートを生成するには：

```bash
pnpm --filter=workers vitest run --coverage
```

カバレッジレポートは `apps/workers/coverage` ディレクトリに生成されます。

## テスト構造

テストは以下のような構造で組織化されています：

### 単体テスト

各コンポーネントは同じディレクトリ内に対応するテストファイルを持ちます：

- `controllers/gym-controller.test.ts`
- `services/gym-service.test.ts`
- `repositories/gym-repository.test.ts`

### 統合テスト

APIエンドポイントの統合テストは、ルーターと同じディレクトリに配置されています：

- `routes/api/gyms/index.test.ts`

### テスト用ヘルパーとフィクスチャ

テスト用のヘルパー関数やフィクスチャは以下のディレクトリにあります：

- `src/test/helpers/` - テスト用のユーティリティ関数
- `src/test/fixtures/` - テスト用のデータ
- `src/test/setup.ts` - テスト環境のセットアップスクリプト

## トラブルシューティング

### よくある問題

1. **D1データベース関連のエラー**

```
Error: D1 Database is not defined
```

これは、`vitest.config.ts` の設定が正しくないか、テストのセットアップスクリプトが正しく実行されていない可能性があります。

解決策：
- `vitest.config.ts` ファイルで D1 データベースが正しく設定されているか確認
- グローバルセットアップファイル `src/test/setup.ts` が正しく参照されているか確認

2. **Cloudflare WorkersのBindingsに関するエラー**

```
Type error: Property 'DB' does not exist on type 'Bindings'
```

これは、型定義が正しく読み込まれていない可能性があります。

解決策：
- テストファイルの先頭に `/// <reference path="../../worker-configuration.d.ts" />` を追加
- `worker-configuration.d.ts` が正しいパスで参照されているか確認

3. **テストタイムアウト**

```
Error: Test timed out in 5000ms
```

非同期テストでの処理に時間がかかっている可能性があります。

解決策：
- `vitest.config.ts` でタイムアウトを増やす：
  ```typescript
  testTimeout: 30000,
  ```

## ベストプラクティス

1. **テストを分離する**
   - 各テストは他のテストに依存せず、独立して動作すべき
   - `beforeEach`でテストデータをリセットする

2. **テスト用のデータを用意する**
   - テスト用のデータはフィクスチャとして `src/test/fixtures/` に配置する
   - 実際のデータ構造に近いものを使用する

3. **モックを適切に使用する**
   - 単体テストでは依存関係をモック化する
   - 統合テストでは実際の依存関係を使用する

4. **エラーケースをテストする**
   - 正常系だけでなく、エラーケースもテストする
   - 境界値のテストを含める

5. **CI/CDパイプラインにテストを統合する**
   - プルリクエスト時に自動的にテストが実行されるようにする
   - テストの失敗によりマージをブロックする
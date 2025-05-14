# ADR 05: テスト戦略とVitest導入

## ステータス

採用済み（2024-05-14更新）

## 背景

Kimeプロジェクトの品質向上と開発効率化のため、テスト自動化の導入が必要となっています。特に、Cloudflare Workers上で動作するバックエンドAPIのテスト方法について検討が必要です。TDD（テスト駆動開発）アプローチの採用も視野に入れた効率的なテスト戦略を策定します。

## 決定事項

1. テストランナーとしてVitestを採用する
2. Cloudflare Workers向けのテストにCloudflare公式テストツール（@cloudflare/vitest-pool-workers）を使用する
3. モノレポ構造に適したテスト設定を導入する
4. Hono APIエンドポイントのテスト手法を標準化する
5. D1データベースのテスト方法を確立する

## 理由

- Vitestは高速な実行速度と良好なDX（開発者体験）を提供する
- VitestはJest互換APIを持ちながらViteの高速ビルド機構を活用できる
- Cloudflare公式テストツールはWorker環境を再現し、バインディングやD1データベースなどの複雑なCloudflare機能のテストをサポートする
- モノレポアプローチにより、共通設定を活用しつつプロジェクト固有の要件に対応できる
- HonoのAPIエンドポイントテストは単体テストと統合テストの両方をサポートする必要がある

## 詳細

### テスト戦略の概要

1. **ユニットテスト**:
   - ビジネスロジック、ユーティリティ関数の個別テスト
   - 外部依存はモック化
   - レイヤー別テスト（Service層、Repository層、Controller層）

2. **統合テスト**:
   - APIエンドポイントの機能テスト（Hono + D1）
   - エンドツーエンドのリクエスト/レスポンスの検証
   - 実際のデータベース操作を含むテスト

3. **テスト環境**:
   - ローカル開発環境でのテスト実行
   - CI/CDパイプラインでの自動テスト
   - 環境変数に基づく条件付きテスト実行

### 技術選定

1. **Vitest**: 
   - Viteベースの高速なテストランナー
   - HMR対応のウォッチモード
   - Jest互換API

2. **@cloudflare/vitest-pool-workers**:
   - Cloudflare公式テストプール
   - Workers環境の完全再現
   - D1データベースのサポート
   - マイグレーション適用機能

3. **モック戦略**:
   - Vitestのモック/スパイ機能
   - Cloudflare環境のモック手法
   - 外部APIとデータベースのモック

### Workers実装の現状（2024-05-14）

#### アーキテクチャ

1. **レイヤードアーキテクチャの採用**:
   - Controller層: リクエスト処理とレスポンス生成
   - Service層: ビジネスロジック
   - Repository層: データアクセス処理

2. **テスト構造**:
   - 各実装ファイルと同じディレクトリに対応するテストファイルを配置
   - 共通テストヘルパーとフィクスチャを`src/test/`ディレクトリに集約
   - D1データベース初期化とマイグレーション適用スクリプトの導入

3. **単体テスト**:
   - GymService: 依存関係をモック化した純粋な単体テスト
   - GymController: Honoコンテキストのモック化とサービス層の振る舞いテスト
   - GymRepository: D1データベース操作のテスト（実データベース使用）

4. **統合テスト**:
   - ジム一覧APIエンドポイント: 実際のHonoアプリケーションを使用したリクエスト/レスポンステスト
   - D1データベースとの統合テスト: フィルタリング、ソート、ページネーション機能の検証

5. **環境依存の課題と解決策**:
   - 条件付きテスト実行: D1データベースが利用可能な場合のみ特定のテストを実行
   - テストデータの自動シード: テスト実行前にテストデータを自動挿入
   - クリーンアップ機能: テスト後のデータリセット

#### テストコードの例

```typescript
// 条件付きテスト実行のヘルパー関数
function itWithD1(name: string, fn: () => Promise<void>) {
  it(name, async () => {
    if (!isD1Available()) return;
    await fn();
  });
}

// Repository層の単体テスト例
describe("GymRepository", () => {
  itWithD1("should return all gyms with default pagination", async () => {
    const result = await repository.findAll({});
    expect(result.items).toHaveLength(3);
    expect(result.meta.total).toBe(3);
  });
});

// Service層の単体テスト例
describe("GymService", () => {
  it("should call repository's findAll method", async () => {
    const mockRepository = createMockGymRepository();
    const service = new GymService(mockRepository);
    await service.getGyms({});
    expect(mockRepository.findAll).toHaveBeenCalled();
  });
});
```

#### 今後の課題

1. **環境分離の強化**:
   - テスト専用のD1データベース設定の確立
   - 環境ごとの設定分離を完全に実現する

2. **テストヘルパーのリファクタリング**:
   - 重複したヘルパー関数の共通化
   - DRY原則の適用

3. **モックデータとスキーマの同期**:
   - テストデータとスキーマの自動同期メカニズムの構築
   - スキーマ変更時のテストデータ自動更新

4. **テストカバレッジの拡充**:
   - エラーケースとエッジケースのテスト強化
   - POST/PATCH/DELETEなどの変更操作テストの充実

## 代替案

1. **Jest**: 
   - 広く使われているテストランナーだが、Viteプロジェクトとの統合が難しい
   - モノレポ設定が複雑になる可能性がある

2. **Miniflare単独使用**:
   - Cloudflare Workers環境のエミュレーションツール
   - テストランナーが別途必要
   - 公式推奨の@cloudflare/vitest-pool-workersと比較して機能が限定的

3. **カスタムテスト環境構築**:
   - 開発工数が大きく、メンテナンスコストが高い
   - Cloudflare環境の変更に追従するのが困難

## 依存関係

- Turborepoパイプライン設定
- Cloudflare Workersデプロイフロー
- D1データベースマイグレーション
- CI/CD設定

## 結果

- 品質の向上（バグの早期発見）
- 開発速度の向上（特にTDDアプローチ採用時）
- コード信頼性の向上
- リファクタリングの安全性確保
- ドキュメントとしてのテスト（機能理解の促進）
- 環境依存の課題を解決するテスト構造の確立
- レイヤードアーキテクチャに適合したテスト手法の標準化
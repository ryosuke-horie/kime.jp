# kime.jp

## 環境情報

turborepo + pnpm workspaceでモノレポ構成をとっています。
一括で利用するコマンドはturbo.jsonに記載します。
turboを直接使うのではなく、pnpmを使ってturboを実行する。

### 開発環境の立ち上げ

`pnpm dev`をプロジェクトルートで実行する。

### テスト

プロジェクトでは [Vitest](https://vitest.dev/) を使用してユニットテストを実行しています。

テスト実行コマンド：
- `pnpm test` - すべてのテストを実行
- `pnpm test:watch` - ウォッチモードでテストを実行
- `pnpm test:coverage` - カバレッジレポート付きでテストを実行

### 型チェック

TypeScriptの型チェックを実行するためのコマンド：
- `pnpm typecheck` - すべてのパッケージの型チェックを実行
- `pnpm --filter=<パッケージ名> typecheck` - 特定のパッケージの型チェックを実行

すべてのパッケージは共通の基本型設定（tsconfig.base.json）を継承しており、厳格な型チェックが適用されています。

### Git Hooks

プロジェクトでは [Husky](https://typicode.github.io/husky/) と [lint-staged](https://github.com/lint-staged/lint-staged) を使用して、Git操作時に自動検証を行っています：

- **pre-commit**: コミット前に以下を実行
  - 変更されたファイルのBiomeによるフォーマットとリント

- **pre-push**: プッシュ前に以下を実行
  - TypeScriptの型チェック (`pnpm typecheck`)
  - テスト実行 (`pnpm test`)

注意: 初回クローン後、`pnpm install`を実行することでGit Hooksが自動的に設定されます。

### CI/CD

GitHub Actionsによる自動化が設定されています：

- ビルド & リント: PRと`main`ブランチへのプッシュ時に実行
- テスト: PRと`main`ブランチへのプッシュ時に実行
- 型チェック: PRと`main`ブランチへのプッシュ時に実行
- カバレッジレポート: `main`ブランチのテスト成功後、GitHub Pagesに公開

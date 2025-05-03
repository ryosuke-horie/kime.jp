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

### CI/CD

GitHub Actionsによる自動化が設定されています：

- ビルド & リント: PRと`main`ブランチへのプッシュ時に実行
- テスト: PRと`main`ブランチへのプッシュ時に実行
- カバレッジレポート: `main`ブランチのテスト成功後、GitHub Pagesに公開

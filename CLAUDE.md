# CLAUDE.md

## 言語設定
- 基本的に日本語で応答してください
- コードやコマンドの説明も日本語で行ってください

## コーディングガイドライン
- Biomeによるフォーマット/リントを適用します。
- anyの使用を禁止し、型推論が効くように実装を進めていきます。
- apps/workers以下はViteを採用しTDDを採用します。
- テストコードは実装のすぐ近くの**.test.tsの形式で記述します。

## コマンド
- pnpm test ... テストコードの実施
- pnpm format ... BiomeによるLint
- pnpm typecheck ... tscによる型チェック
- gh ... GitHub CLIでIssueやPRの作成・閲覧に使用

## プロジェクト構造
- Turborepo と pnpm で管理されたモノレポ構成
- アプリ:
  - `web`: NextjsとShadcn/uiを利用して構築するフロントエンド
  - `workers`: Hono フレームワークを使用した Cloudflare Workers API
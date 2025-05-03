# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 言語設定
- 基本的に日本語で応答してください
- コードやコマンドの説明も日本語で行ってください

## コマンド
- ビルド: `pnpm build` (全て) または `pnpm --filter=<app> build`
- 開発: `pnpm dev` (全て) または `pnpm --filter=<app> dev`
- リント: `pnpm lint` または `pnpm --filter=<app> lint`
- フォーマット: `pnpm format` または `pnpm --filter=<app> format`
- デプロイ: `pnpm deploy` または `pnpm --filter=<app> deploy`
- プレビュー: `pnpm --filter=<app> preview` (web と workers 用)

## コードスタイルガイドライン
- Biome を使用してリントとフォーマットを行う (ESLint は使用しない)
- インデント: タブ（スペースではなく）
- 引用符: ダブルクォート
- React コンポーネント: パスカルケース (`RootLayout`, `Home`)
- 変数/関数: キャメルケース
- インポート: インポートを整理する (`import React from 'react'` を他のインポートの前に配置)
- 型アノテーション: TypeScript のインターフェースと型を使用する
- エラー処理: try/catch ブロックを使用する
- ファイル構造: モノレポの既存パターンに従う

## プロジェクト構造
- Turborepo と pnpm で管理されたモノレポ
- アプリ:
  - `web`: Turbopack と Cloudflare デプロイメントを備えた Next.js アプリ
  - `workers`: Hono フレームワークと Vite を使用した Cloudflare Workers
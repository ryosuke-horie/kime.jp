# MVPタスク分解

以下は **GitHub Issues にそのまま起票できる粒度** でタスクを分割した一覧です。  
各項目の **見積もり (Story Point)** はフィボナッチ数列 (1 | 2 | 3 | 5 | 8) を採用し、8 を超えるものは必ず分割しています。  
――番号順に上から下へ実施すると、依存関係で詰まりにくい構成です。  

| # | Issue タイトル | 概要 & 完了条件 | SP |
|---|---------------|----------------|----|
| **Milestone 0 — Repository & Toolchain** |
| 1 | **chore(repo): Turborepo + pnpm でモノレポ初期化** | `apps/` `packages/` など空フォルダを含め初期コミット。README に ADR リンクを添付 | 3 |
| 2 | **chore(config): Biome / ESLint / Prettier 統合** | ワークスペース ルートに共通設定＋ `pnpm lint` script | 2 |
| 3 | **chore(config): Vitest + ts‑config 共通化** | ESM & Edge 互換で動作する tsconfig を `packages/tsconfig/` として発行 | 2 |
| **Milestone 1 — Infrastructure Skeleton** |
| 4 | **infra(wrangler): 3 env (preview/prod/test) 定義** | `wrangler.toml` に D1/KV/R2 Binding を env 別に分離 | 3 |
| 5 | **infra(terraform): Cloudflare Zero Trust 基本セット** | preview 用 Access Application + GitHub IdP 連携まで | 5 |
| 6 | **docs(ADR): デプロイフロー & Access 設定手順記載** | `/docs/ADR‑deploy.md` に CLI / UI 両手順を記載 | 1 |
| **Milestone 2 — Database & Migration** |
| 7 | **db(drizzle): SQLite スキーマ定義移植** | `packages/db/schema.ts` に一覧を Typed Drizzle で実装 | 5 |
| 8 | **db(script): `wrangler d1 migrations` 自動化 CI** | `apps/worker` 配下でマイグレーション → preview/prod へ適用 | 3 |
| 9 | **db(seed): テストデータ 50 会員分 Seed スクリプト** | Prisma‑like CLI で本番には走らないよう guard | 2 |
| **Milestone 3 — API Worker 基盤** |
| 10 | **feat(worker): Hono + openapi‑types 雛形** | `/healthz` と `/version` のみ返す最小 fetch 実装 | 3 |
| 11 | **feat(worker): 中間層 middleware (auth / rate‑limit)** | JWT 検証 & GitHub ServiceToken 検証ロジックを置く | 5 |
| 12 | **feat(worker): bookings CRUD v0 実装** | `features/bookings` で Create+List+Cancel 3 エンドポイント | 5 |
| 13 | **test(worker): Bookings API unit + e2e (@cloudflare/workers‑mock)** | happy path + reservation 二重防止を検証 | 3 |
| **Milestone 4 — ClassLocker Durable Object** |
| 14 | **feat(agent): ClassLocker DO skeleton** | `apps/agent/src/agents/booking_flow.ts` で lock & insert | 5 |
| 15 | **test(agent): DO concurrency stress test (5 req/s)** | Wrangler local でベンチ、衝突 0 を確認 | 3 |
| **Milestone 5 — AI Agent Framework** |
| 16 | **feat(agent): ChatAgent DO skeleton + OpenAI stub** | `POST /agents/chat/:memberId` → echo 応答 | 3 |
| 17 | **feat(agent): R2 Vectorize バインディング結線** | `memories/*` のラッパーを用意しテスト挿入 | 2 |
| 18 | **docs(ai-utils): Prompt 雛形 & ガードレール指針** | `packages/ai-utils/README.md` に記載 | 1 |
| **Milestone 6 — Frontend Skeleton (Next.js 15)** |
| 19 | **feat(web): next‑infra bootstrap (app router)** | Tailwind + shadcn/ui を初期セット | 3 |
| 20 | **feat(web): (auth) RouteGroup + 実装ダミー** | `/signin`, `/callback` で JWT 取得モック | 3 |
| 21 | **feat(web): (member)/dashboard MVP** | 予約一覧 + 新規予約 → Worker 呼び出し | 5 |
| 22 | **feat(web): (staff)/classes + Parallel Route 試作** | list & 詳細ペイン (空ダイアログ) | 5 |
| 23 | **test(web): Playwright visual regression CI** | 主要 2 画面のスクショ比較を PR に貼付 | 3 |
| **Milestone 7 — CI/CD & Preview** |
| 24 | **ci: GitHub Workflow `deploy.yml` 実装** | matrix env で preview/prod デプロイ、自動コメント確認 | 3 |
| 25 | **ci: Worker Builds GitHub App インストール & 試験** | PR #1 に preview URL が貼られること | 2 |
| 26 | **ci: Storybook or Playwright report 確認用 Artifact** | GitHub Pages artifact のみ | 2 |
| **Milestone 8 — Observability** |
| 27 | **ops: Workers Logs + Logpush to R2 有効化** | 14 d → R2 90 d のライフサイクル rule | 2 |
| 28 | **ops: Analytics Engine カスタム指標埋込** | `do_lock_wait_ms`, `d1_query_ms` histogram 計測 | 3 |
| 29 | **ops: Sentry Edge SDK 導入 + PII scrub 設定** | `beforeSend` で email/phone マスク | 3 |
| 30 | **ops: Healthcheck URL & Slack 通知連携** | `/healthz` ping failure で #alert | 2 |
| **Milestone 9 — Docs & Automation** |
| 31 | **docs: CONTRIBUTING.md (Vibe Coding 手順)** | Cursor / Claude / Copilot 併用フロー明記 | 2 |
| 32 | **docs: runbooks/incident‑ai‑latency.md** | AI エージェント遅延／障害時のチェックリスト | 1 |
| 33 | **automation: Weekly D1 Insights export to R2 (Cron Worker)** | JSONL 生成 & R2 put、成功ログを AE 記録 | 3 |
| **Milestone 10 — リリース準備** |
| 34 | **chore(security): mTLS 証明書発行 & ワーカー検証** | 高権限 API 1 ルートを対象 | 3 |
| 35 | **feat(web): 利用規約モーダル & KV 最新版チェック** | `need_consent` 時に強制表示 → consents へ POST | 5 |
| 36 | **qa: 50 名 1 週間ロードテスト (k6)** | p95 < 300 ms を確認 | 5 |
| 37 | **release: v0.1 タグ & CHANGELOG 生成** | GitHub Release ドラフト & docs 更新 | 1 |

### 合計ストーリーポイント

| Milestone | SP |
|-----------|----|
| 0 | 7 |
| 1 | 9 |
| 2 | 10 |
| 3 | 16 |
| 4 | 8 |
| 5 | 6 |
| 6 | 19 |
| 7 | 7 |
| 8 | 10 |
| 9 | 6 |
| 10 | 14 |
| **総計** | **112 SP** |

> **目安**: 1 SP ≒ 0.5 〜 1.5 h（Vibe Coding＋AI 支援込み）  
> 週 20 h 稼働なら **約 6 〜 8 週間** で MVP 0.1 リリースが射程内です。  

---

#### 使い方ヒント

* **GitHub Projects (table view)** で上記をコピペ → `Estimate` フィールドを追加しバーンダウン。  
* Vibe Coding 中は **Issue 番号をコミットメッセージに必ず付与**すると後で振り返りやすくなります。  
* 仕様変更や技術的知見が増えたら **`docs/decisions/` にミニ ADR** を追加し、次回イテレーション時に SP を再計測してください。
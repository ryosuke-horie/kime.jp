# ADR‑001 — 会員管理 SaaS MVP：アーキテクチャ & データモデル

---

## 1. 背景

会員 50 名規模の小規模格闘技ジムでは、予約自動化と軽量 CRM が必要だが、高額な SaaS を負担できない。MVP では **月額 3,000 円** で粗利率 95 %以上を目指す。主な差別化要素は以下。

* タイムテーブルそっくりの予約 UI
* LLM による自動応答・体験後フォロー
* QR/NFC 入退館ログ
* LINE／メールによる自動リマインド・追客

インフラコスト上限：Cloudflare Workers + D1 + KV で **約 900 円／月**。

規制対応:
* プライバシーポリシー／利用規約への同意ログを会員単位で保存
* AI 会話データを監査と改善のため長期保存

---

## 2. 決定

### 2.1 ランタイム構成

| コンポーネント | 採用技術 | 理由 |
|--------------|-----------|------|
| エッジ実行環境 | **Cloudflare Workers（有料版）** | LINE とブラウザへの低遅延、基本料金 $5 |
| メイン DB | **Cloudflare D1（SQLite）** | 5 GB／月・50 M 書き込み無料枠、SQL & FK 対応 |
| ホットスポット直列化 | **Durable Objects** | 帯域制限・Stripe Webhook の ACID 保証 |
| キャッシュ & バックアップ | KV / R2 | 低コスト、ポリシー版キャッシュ＆バックアップ |
| フロントエンド | Next.js 15 app‑router | フロントエンド |

### 2.2 データモデル（SQLite→Postgres 互換）

> 全テーブルは `TEXT` UUID 主キー、将来の多店舗対応に備えて `gym_id` を保持し、`created_at / updated_at` を共通列とする。

| ドメイン | テーブル／ポイント |
|----------|------------------|
| **コア** | `gyms`, `members`（status: active／suspended／withdrawn）, `classes`, `bookings`, `checkins` |
| **スタッフ運用** | `staff`（role: admin／reception）, `class_staff`（多対多）, `shifts` |
| **法令同意** | `consents`（privacy／tos, version = YYYY‑MM‑DD） |
| **AI ログ** | `ai_conversations`, `ai_messages`, `ai_outcomes` — 送受信内容・トークン・AI 成否・人手介入を記録 |
| **休会ポリシー** | `suspension_policies` — ジム別 JSON 設定 |
| **決済（将来用）** | `payments` — Stripe 再導入時に利用 |

### 2.3 予約整合性

`ClassLocker` Durable Object が D1 で `BEGIN…COMMIT` を実行し、`bookings` に `ON CONFLICT DO NOTHING` で挿入。これにより二重予約を防止。他の読み取りは直接 Workers から行う。

### 2.4 規約・同意管理

最新バージョンを KV にキャッシュ。会員登録または予約時に比較し、古ければ `need_consent=true` を返却しフロントでモーダル同意 → `consents` へ INSERT。

### 2.5 AI 会話ログ

* 予約 URL 送信＝`ai_messages` に `sender='ai'` で保存
* 会員返信＝`sender='member'`
* 高信頼なら自動返信→`auto_replied=1`、低信頼なら `escalated=1`
* スタッフ送信＝`sender='staff'`, `override_by_staff=1`
* 週次 Cron で結合ビューを JSONL で R2 へエクスポートし、RAG / 品質分析に活用

### 2.6 MVP ではスコープ外

* 定期課金・サブスク管理
* 多店舗ジム対応（`gym_id` 列で準備のみ）
* 電子署名サービス（コメント列で備忘）

---

## 3. 結果と影響

### 正の効果
* **1,000 円未満の OpEx** で UX & 監査要件を満たす
* Postgres 互換スキーマ → Neon / Supabase へ DSN 切替のみで移行可能
* AI ログ構造化により改善ループとコスト分析が容易

### 負の効果 / トレードオフ
* D1 書き込み上限 50 M。会員 150 名超で移行が必要
* マルチテナント UI を持たないため、複数店舗展開時はデプロイ分割
* 決済後回しのため ROI 証明は初期オンボーディングの手間に依存

---

## 4. 検討したが採用しなかった案

| 代替案 | 理由 |
|---------|------|
| **Supabase Pro を day1 から採用** | コストが 4,000 円／月以上で粗利を圧迫 |
| **Planetscale MySQL + Workers** | 追加レイテンシと DO でのトランザクション不整合 |
| **オールイン Stripe (Checkout + Portal)** | 予約先行方針に反し、複雑なサブスク管理を早期に強制 |

---

## 5. DBスキーマ案
```sql
PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------
-- gyms
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS gyms (
  gym_id        TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  timezone      TEXT DEFAULT 'Asia/Tokyo',
  owner_email   TEXT NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'basic',
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- members
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS members (
  member_id        TEXT PRIMARY KEY,
  gym_id           TEXT NOT NULL,
  name             TEXT NOT NULL,
  email            TEXT,
  phone            TEXT,
  status           TEXT NOT NULL
                     CHECK (status IN ('active','suspended','withdrawn'))
                     DEFAULT 'active',
  joined_at        TEXT,
  policy_version   TEXT,
  policy_signed_at TEXT,
  created_at       TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at       TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (gym_id, email),
  FOREIGN KEY (gym_id) REFERENCES gyms(gym_id)
);

-- ----------------------------------------------------------
-- classes
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
  class_id     TEXT PRIMARY KEY,
  gym_id       TEXT NOT NULL,
  title        TEXT NOT NULL,
  starts_at    TEXT NOT NULL,
  ends_at      TEXT NOT NULL,
  capacity     INTEGER NOT NULL,
  instructor   TEXT,
  created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at   TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gym_id) REFERENCES gyms(gym_id)
);

CREATE INDEX IF NOT EXISTS idx_classes_time
  ON classes (gym_id, starts_at);

-- ----------------------------------------------------------
-- bookings
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  booking_id   TEXT PRIMARY KEY,
  gym_id       TEXT NOT NULL,
  class_id     TEXT NOT NULL,
  member_id    TEXT NOT NULL,
  status       TEXT NOT NULL
                 CHECK (status IN ('reserved','cancelled','attended','no_show'))
                 DEFAULT 'reserved',
  booked_at    TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (class_id, member_id),
  FOREIGN KEY (gym_id)    REFERENCES gyms(gym_id),
  FOREIGN KEY (class_id)  REFERENCES classes(class_id),
  FOREIGN KEY (member_id) REFERENCES members(member_id)
);

-- ----------------------------------------------------------
-- check‑ins
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS checkins (
  checkin_id   TEXT PRIMARY KEY,
  gym_id       TEXT NOT NULL,
  member_id    TEXT NOT NULL,
  scanned_at   TEXT DEFAULT CURRENT_TIMESTAMP,
  source       TEXT CHECK (source IN ('qr','nfc')),
  FOREIGN KEY (gym_id)    REFERENCES gyms(gym_id),
  FOREIGN KEY (member_id) REFERENCES members(member_id)
);

-- ----------------------------------------------------------
-- staff / shifts
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff (
  staff_id     TEXT PRIMARY KEY,
  gym_id       TEXT NOT NULL,
  name         TEXT NOT NULL,
  email        TEXT,
  role         TEXT NOT NULL
                 CHECK (role IN ('admin','reception'))
                 DEFAULT 'reception',
  active       INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gym_id) REFERENCES gyms(gym_id)
);

CREATE TABLE IF NOT EXISTS class_staff (   -- M:N
  class_id     TEXT NOT NULL,
  staff_id     TEXT NOT NULL,
  PRIMARY KEY (class_id, staff_id),
  FOREIGN KEY (class_id) REFERENCES classes(class_id),
  FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

CREATE TABLE IF NOT EXISTS shifts (
  shift_id     TEXT PRIMARY KEY,
  gym_id       TEXT NOT NULL,
  staff_id     TEXT NOT NULL,
  starts_at    TEXT NOT NULL,
  ends_at      TEXT NOT NULL,
  created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gym_id)  REFERENCES gyms(gym_id),
  FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

-- ----------------------------------------------------------
-- legal consents
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS consents (
  consent_id     TEXT PRIMARY KEY,
  member_id      TEXT NOT NULL,
  document_type  TEXT NOT NULL
                    CHECK (document_type IN ('privacy','tos')),
  version        TEXT NOT NULL,
  signed_at      TEXT DEFAULT CURRENT_TIMESTAMP,
  signature_hash TEXT,
  FOREIGN KEY (member_id) REFERENCES members(member_id)
);

-- ----------------------------------------------------------
-- AI conversation logging
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_conversations (
  conversation_id TEXT PRIMARY KEY,
  gym_id          TEXT NOT NULL,
  member_id       TEXT,
  booking_id      TEXT,
  started_at      TEXT DEFAULT CURRENT_TIMESTAMP,
  last_msg_at     TEXT,
  FOREIGN KEY (gym_id)     REFERENCES gyms(gym_id),
  FOREIGN KEY (member_id)  REFERENCES members(member_id),
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

CREATE TABLE IF NOT EXISTS ai_messages (
  msg_id        TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender        TEXT NOT NULL
                  CHECK (sender IN ('ai','member','staff')),
  staff_id      TEXT,
  channel       TEXT NOT NULL
                  CHECK (channel IN ('line','email','web')),
  content       TEXT,
  ai_model      TEXT,
  tokens_in     INTEGER,
  tokens_out    INTEGER,
  confidence    REAL,
  sent_at       TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES ai_conversations(conversation_id),
  FOREIGN KEY (staff_id)       REFERENCES staff(staff_id)
);

CREATE TABLE IF NOT EXISTS ai_outcomes (
  outcome_id        TEXT PRIMARY KEY,
  msg_id            TEXT NOT NULL,
  auto_replied      INTEGER DEFAULT 0,  -- 1 = 完全自動回答
  escalated         INTEGER DEFAULT 0,  -- 1 = AI から人へエスカレーション
  override_by_staff INTEGER DEFAULT 0,  -- 1 = スタッフが上書き回答
  reason            TEXT,
  latency_ms        INTEGER,
  created_at        TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (msg_id) REFERENCES ai_messages(msg_id)
);

-- （任意）全文検索テーブル
CREATE VIRTUAL TABLE IF NOT EXISTS ai_messages_fts
  USING fts5(content, content_rowid = 'msg_id');

-- ----------------------------------------------------------
-- suspension policy (休会料金の柔軟設定)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS suspension_policies (
  gym_id          TEXT PRIMARY KEY,
  fee_type        TEXT NOT NULL
                    CHECK (fee_type IN ('fixed','percentage','free'))
                    DEFAULT 'free',
  fee_value       INTEGER,
  min_term_months INTEGER DEFAULT 1,
  note            TEXT,
  updated_at      TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gym_id) REFERENCES gyms(gym_id)
);

-- ----------------------------------------------------------
-- payments (Stripe 再導入用プレースホルダ)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  order_id              TEXT PRIMARY KEY,
  gym_id                TEXT NOT NULL,
  member_id             TEXT,
  stripe_session_id     TEXT,
  stripe_payment_intent TEXT UNIQUE,
  amount                INTEGER,
  currency              TEXT DEFAULT 'JPY',
  status                TEXT
                         CHECK (status IN ('pending','succeeded','failed','refunded'))
                         DEFAULT 'pending',
  paid_at               TEXT,
  created_at            TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at            TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gym_id)   REFERENCES gyms(gym_id),
  FOREIGN KEY (member_id) REFERENCES members(member_id)
);

```

---

## 6. 決定履歴
* **2025‑04‑20** — 上記内容で ADR 承認：Workers + D1 による MVP、決済機能は後回し、AI ログスキーマ追加。

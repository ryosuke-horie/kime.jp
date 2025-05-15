/**
 * テスト環境用のD1マイグレーション適用スクリプト
 */
/// <reference path="../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";

/**
 * テスト用のデータをD1データベースに挿入
 */
async function seedTestData() {
	if (typeof env === "undefined" || !env.DB) {
		console.warn("D1 database is not available in test environment");
		return;
	}

	try {
		// gymsテーブルの作成 (マイグレーションが自動適用されない場合に備えて)
		await env.DB.prepare(`
			CREATE TABLE IF NOT EXISTS gyms (
				gym_id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				owner_email TEXT NOT NULL,
				created_at TEXT DEFAULT CURRENT_TIMESTAMP,
				updated_at TEXT DEFAULT CURRENT_TIMESTAMP
			)
		`).run();

		// adminAccountsテーブルの作成
		await env.DB.prepare(`
			CREATE TABLE IF NOT EXISTS admin_accounts (
				admin_id TEXT PRIMARY KEY,
				email TEXT NOT NULL UNIQUE,
				name TEXT NOT NULL,
				role TEXT NOT NULL CHECK(role IN ('admin', 'staff')) DEFAULT 'staff',
				password_hash TEXT,
				is_active INTEGER NOT NULL DEFAULT 1,
				last_login_at TEXT,
				created_at TEXT DEFAULT CURRENT_TIMESTAMP,
				updated_at TEXT DEFAULT CURRENT_TIMESTAMP
			)
		`).run();

		// adminGymRelationshipsテーブルの作成
		await env.DB.prepare(`
			CREATE TABLE IF NOT EXISTS admin_gym_relationships (
				admin_id TEXT NOT NULL,
				gym_id TEXT NOT NULL,
				role TEXT NOT NULL CHECK(role IN ('owner', 'manager', 'staff')) DEFAULT 'staff',
				created_at TEXT DEFAULT CURRENT_TIMESTAMP,
				PRIMARY KEY (admin_id, gym_id),
				FOREIGN KEY (admin_id) REFERENCES admin_accounts(admin_id) ON DELETE CASCADE,
				FOREIGN KEY (gym_id) REFERENCES gyms(gym_id) ON DELETE CASCADE
			)
		`).run();

		// テストデータを挿入
		await env.DB.prepare(`
			INSERT OR IGNORE INTO gyms (gym_id, name, owner_email, created_at, updated_at)
			VALUES 
				('gym-1', 'フィットネスジムA', 'owner1@example.com', '2023-01-01T00:00:00.000Z', '2023-01-01T00:00:00.000Z'),
				('gym-2', 'スポーツジムB', 'owner2@example.com', '2023-01-02T00:00:00.000Z', '2023-01-02T00:00:00.000Z'),
				('gym-3', 'トレーニングセンターC', 'owner3@example.com', '2023-01-03T00:00:00.000Z', '2023-01-03T00:00:00.000Z')
		`).run();

		console.log("Test data seeded successfully");
	} catch (error) {
		console.error("Failed to seed test data:", error);
	}
}

// Vitestのsetupファイルとして実行されるときに自動的に実行
await seedTestData();

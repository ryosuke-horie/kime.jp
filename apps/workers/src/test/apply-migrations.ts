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
		// テーブルの作成 (マイグレーションが自動適用されない場合に備えて)
		await env.DB.prepare(`
			CREATE TABLE IF NOT EXISTS gyms (
				gym_id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				owner_email TEXT NOT NULL,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`).run();

		// テストデータを挿入
		await env.DB.prepare(`
			INSERT OR IGNORE INTO gyms (gym_id, name, owner_email, created_at, updated_at)
			VALUES 
				('gym-1', 'フィットネスジムA', 'owner1@example.com', 1620000000, 1620000000),
				('gym-2', 'スポーツジムB', 'owner2@example.com', 1620100000, 1620100000),
				('gym-3', 'トレーニングセンターC', 'owner3@example.com', 1620200000, 1620200000)
		`).run();

		console.log("Test data seeded successfully");
	} catch (error) {
		console.error("Failed to seed test data:", error);
	}
}

// Vitestのsetupファイルとして実行されるときに自動的に実行
await seedTestData();

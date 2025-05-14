/**
 * テスト環境用のD1マイグレーション適用スクリプト
 */
import { env } from "cloudflare:test";
import { readD1Migrations, applyD1Migrations } from "@cloudflare/vitest-pool-workers/d1";
import { join } from "path";

/**
 * D1マイグレーションを適用する
 */
export async function setupTestDatabase() {
	try {
		// マイグレーションを読み込む
		// wrangler.tomlから環境をロードするため、worker.envではなくenv.DBを使用
		const migrations = readD1Migrations({
			migrationsPath: join(process.cwd(), "./migrations"),
		});

		// 利用可能なマイグレーションを適用
		const result = await applyD1Migrations(env.DB, migrations);
		console.log(`Applied ${result.migrations.length} migrations to D1 database`);

		// テスト用のデータを準備
		// 必要に応じてテストデータをロード
		await seedTestData();
	} catch (error) {
		console.error("Failed to apply migrations:", error);
	}
}

/**
 * テスト用のデータをD1データベースに挿入
 */
async function seedTestData() {
	try {
		// テーブルに初期データを挿入
		await env.DB.prepare(`
      INSERT OR IGNORE INTO gyms (id, name, owner_email, created_at, updated_at)
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
if (typeof env !== "undefined" && env.DB) {
	await setupTestDatabase();
} else {
	console.warn("D1 database is not available in test environment");
}
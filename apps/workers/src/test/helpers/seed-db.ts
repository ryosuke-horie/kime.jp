/// <reference path="../../../worker-configuration.d.ts" />
import { gymFixtures } from "../fixtures/gym-fixtures";

/**
 * テストデータベース内のadminAccountsとadminGymRelationshipsテーブルをクリアする
 */
export async function clearAdminTables(db: D1Database): Promise<void> {
	try {
		// adminGymRelationshipsテーブルをクリア（外部キー制約があるため先にクリア）
		await db.exec("DELETE FROM admin_gym_relationships");

		// adminAccountsテーブルをクリア
		await db.exec("DELETE FROM admin_accounts");
	} catch (error) {
		console.error("Failed to clear admin tables:", error);
	}
}

/**
 * ジムテストデータをDBに挿入する関数
 */
export async function seedGymData(db: D1Database): Promise<void> {
	try {
		// 一括でデータを挿入するSQLを構築
		const placeholders = gymFixtures.map(() => "(?, ?, ?, ?, ?)").join(", ");

		const values = gymFixtures.flatMap((gym) => [
			gym.gymId,
			gym.name,
			gym.ownerEmail,
			gym.createdAt || new Date().toISOString(),
			gym.updatedAt || new Date().toISOString(),
		]);

		// SQLを実行してテストデータを挿入
		await db
			.prepare(`
			INSERT INTO gyms (
				gym_id, name, owner_email, created_at, updated_at
			) VALUES ${placeholders}
		`)
			.bind(...values)
			.run();
	} catch (error) {
		console.error("Failed to seed gym data:", error);
	}
}

/**
 * テスト用データをDBに挿入する関数（環境変数経由）
 */
export async function seedTestData(): Promise<void> {
	if (!globalThis.DB) {
		console.error("D1 database is not available in the test environment");
		return;
	}

	try {
		// ジムデータをシード
		await seedGymData(globalThis.DB);
	} catch (error) {
		console.error("Failed to seed test data:", error);
	}
}

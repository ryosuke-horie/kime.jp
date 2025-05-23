import { beforeEach, describe, expect, it } from "vitest";
import { gyms } from "../../db/schema";
import { applyMigrationsToTestDB, resetTestDatabase } from "../helpers/migration-runner";
import { createTestDb, getTestEnv } from "../helpers/test-utils";
import { withTransactionalTest } from "../helpers/transactional-test";
import { TEST_ENV_CONFIG } from "../test-env-config";

describe("テスト環境分離の統合テスト", () => {
	let db: ReturnType<typeof createTestDb>;
	
	beforeEach(() => {
		const { DB, isTestEnv } = getTestEnv();
		if (!isTestEnv || !DB) {
			throw new Error("テスト環境が正しく設定されていません");
		}
		db = createTestDb();
	});

	describe("環境変数の統一管理", () => {
		it("環境変数が統一設定から正しく読み込まれている", () => {
			const env = getTestEnv();
			
			// .dev.varsから読み込まれた値、または統一設定のデフォルト値を使用
			expect(env.NODE_ENV).toBeDefined();
			expect(env.SKIP_AUTH).toBeDefined();
			expect(env.JWT_SECRET).toBeDefined();
			
			// 統一設定が利用可能であることを確認
			expect(TEST_ENV_CONFIG.NODE_ENV).toBe("test");
			expect(TEST_ENV_CONFIG.SKIP_AUTH).toBe("true");
			expect(TEST_ENV_CONFIG.JWT_SECRET).toBe("test-secret-key");
		});

		it("テストデータベースが正しく設定されている", () => {
			const env = getTestEnv();
			
			expect(env.DB).toBeDefined();
			expect(env.isTestEnv).toBe(true);
		});
	});

	describe("マイグレーションの適用と管理", () => {
		it("マイグレーションが正しく適用され、テーブルが作成される", async () => {
			const { DB, isTestEnv } = getTestEnv();
			if (!isTestEnv || !DB) return;
			
			// データベースをリセット
			await resetTestDatabase(DB);
			
			// マイグレーションを適用
			const result = await applyMigrationsToTestDB(DB);
			
			expect(result.success).toBe(true);
			expect(result.appliedCount).toBeGreaterThan(0);
			
			// テーブルが作成されたことを確認
			const gymsList = await db.select().from(gyms);
			expect(gymsList).toBeDefined();
		});

		it("マイグレーション履歴が正しく管理される", async () => {
			const { DB, isTestEnv } = getTestEnv();
			if (!isTestEnv || !DB) return;
			
			// データベースをリセット
			await resetTestDatabase(DB);
			
			// 1回目の適用
			const firstResult = await applyMigrationsToTestDB(DB);
			expect(firstResult.appliedCount).toBeGreaterThan(0);
			
			// 2回目の適用（スキップされるはず）
			const secondResult = await applyMigrationsToTestDB(DB);
			expect(secondResult.appliedCount).toBe(0);
			expect(secondResult.skippedCount).toBeGreaterThan(0);
		});
	});

	describe("トランザクショナルなテスト実行", () => {
		it("テスト実行後にデータが自動的にクリーンアップされる", async () => {
			const { DB, isTestEnv } = getTestEnv();
			if (!isTestEnv || !DB) return;
			
			const testGymId = "isolation-test-gym-1";
			
			// トランザクショナルテストを実行
			await withTransactionalTest(DB, async (db) => {
				await db.prepare(`
					INSERT INTO gyms (gym_id, name, owner_email) 
					VALUES (?, ?, ?)
				`).bind(testGymId, "Isolation Test Gym", "isolation@example.com").run();
				
				// データが存在することを確認
				const result = await db.prepare("SELECT * FROM gyms WHERE gym_id = ?")
					.bind(testGymId)
					.first();
				
				expect(result).toBeDefined();
			});
			
			// テスト後、データがクリーンアップされていることを確認
			const afterResult = await DB.prepare("SELECT * FROM gyms WHERE gym_id = ?")
				.bind(testGymId)
				.first();
			
			expect(afterResult).toBeNull();
		});
	});

	describe("テスト間の分離", () => {
		it("複数のテストが互いに影響しない", async () => {
			const { DB, isTestEnv } = getTestEnv();
			if (!isTestEnv || !DB) return;
			
			// テスト1: データを挿入
			const test1GymId = "isolation-test-gym-2";
			await DB.prepare(`
				INSERT INTO gyms (gym_id, name, owner_email) 
				VALUES (?, ?, ?)
			`).bind(test1GymId, "Test 1 Gym", "test1@example.com").run();
			
			// データが存在することを確認
			const result1 = await DB.prepare("SELECT * FROM gyms WHERE gym_id = ?")
				.bind(test1GymId)
				.first();
			expect(result1).toBeDefined();
		});

		it("前のテストのデータが残っていない", async () => {
			const { DB, isTestEnv } = getTestEnv();
			if (!isTestEnv || !DB) return;
			
			// 前のテストで挿入されたデータが存在しないことを確認
			const test1GymId = "isolation-test-gym-2";
			const result = await DB.prepare("SELECT * FROM gyms WHERE gym_id = ?")
				.bind(test1GymId)
				.first();
			
			expect(result).toBeNull();
			
			// 新しいデータを挿入
			const test2GymId = "isolation-test-gym-3";
			await DB.prepare(`
				INSERT INTO gyms (gym_id, name, owner_email) 
				VALUES (?, ?, ?)
			`).bind(test2GymId, "Test 2 Gym", "test2@example.com").run();
			
			// 新しいデータが存在することを確認
			const result2 = await DB.prepare("SELECT * FROM gyms WHERE gym_id = ?")
				.bind(test2GymId)
				.first();
			expect(result2).toBeDefined();
		});
	});

	describe("エラーハンドリング", () => {
		it("エラーが発生してもテスト環境が破壊されない", async () => {
			const { DB, isTestEnv } = getTestEnv();
			if (!isTestEnv || !DB) return;
			
			try {
				// 意図的にエラーを発生させる（存在しないテーブルへの挿入）
				await DB.prepare(`
					INSERT INTO non_existent_table (id, name) 
					VALUES (?, ?)
				`).bind("test-id", "test-name").run();
			} catch (error) {
				// エラーが発生することを確認
				expect(error).toBeDefined();
			}
			
			// エラー後もデータベースが正常に動作することを確認
			const gyms = await DB.prepare("SELECT COUNT(*) as count FROM gyms").first();
			expect(gyms).toBeDefined();
			expect(typeof gyms?.count).toBe("number");
		});
	});
});
import { describe, expect, it } from "vitest";
import { applyMigrationsToTestDB, getMigrations } from "./migration-runner";
import { getTestEnv } from "./test-utils";

describe("Migration Runner", () => {
	describe("getMigrations", () => {
		it("マイグレーションを取得できる", async () => {
			const migrations = await getMigrations();
			
			expect(migrations).toBeDefined();
			expect(Array.isArray(migrations)).toBe(true);
			expect(migrations.length).toBeGreaterThan(0);
			
			// マイグレーションがソートされていることを確認
			for (let i = 1; i < migrations.length; i++) {
				expect(migrations[i - 1].id < migrations[i].id).toBe(true);
			}
			
			// マイグレーションIDの形式を確認
			for (const migration of migrations) {
				expect(migration.id).toMatch(/^\d{4}_/);
				expect(migration.sql).toBeDefined();
				expect(typeof migration.sql).toBe("string");
				expect(migration.sql.length).toBeGreaterThan(0);
			}
		});
	});

	describe("applyMigrationsToTestDB", () => {
		it("テストデータベースにマイグレーションを適用できる", async () => {
			const { DB, isTestEnv } = getTestEnv();
			
			if (!isTestEnv || !DB) {
				console.warn("⚠️ テスト環境が設定されていないため、このテストはスキップされます");
				return;
			}
			
			// テスト前にデータベースをリセット
			const { resetTestDatabase } = await import("./migration-runner");
			await resetTestDatabase(DB);
			
			const result = await applyMigrationsToTestDB(DB);
			
			expect(result.success).toBe(true);
			expect(result.appliedCount + result.skippedCount).toBeGreaterThan(0);
			expect(result.errors).toHaveLength(0);
			
			// テーブルが作成されたことを確認
			const tables = await DB.prepare(`
				SELECT name FROM sqlite_master 
				WHERE type='table' 
				ORDER BY name
			`).all();
			
			expect(tables.results.length).toBeGreaterThan(0);
			
			// 主要なテーブルが存在することを確認
			const tableNames = tables.results.map((t: any) => t.name);
			expect(tableNames).toContain("gyms");
			expect(tableNames).toContain("admin_accounts");
			expect(tableNames).toContain("admin_gym_relationships");
		});

		it("マイグレーション履歴を管理できる", async () => {
			const { DB, isTestEnv } = getTestEnv();
			
			if (!isTestEnv || !DB) {
				console.warn("⚠️ テスト環境が設定されていないため、このテストはスキップされます");
				return;
			}
			
			// テスト前にデータベースをリセット
			const { resetTestDatabase } = await import("./migration-runner");
			await resetTestDatabase(DB);
			
			// 1回目の適用
			const firstResult = await applyMigrationsToTestDB(DB);
			expect(firstResult.success).toBe(true);
			expect(firstResult.appliedCount).toBeGreaterThan(0);
			
			// 2回目の適用（既に適用済みなのでスキップされるはず）
			const secondResult = await applyMigrationsToTestDB(DB);
			expect(secondResult.success).toBe(true);
			expect(secondResult.appliedCount).toBe(0);
			expect(secondResult.skippedCount).toBeGreaterThan(0);
		});
	});
});
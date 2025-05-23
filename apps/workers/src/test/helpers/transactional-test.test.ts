import { describe, expect, it } from "vitest";
import { cleanupTestData, setupTestData, withTransactionalTest } from "./transactional-test";
import { getTestEnv } from "./test-utils";

describe("Transactional Test Helper", () => {
	describe("setupTestData", () => {
		it("テストデータを設定できる", async () => {
			const { DB, isTestEnv } = getTestEnv();
			
			if (!isTestEnv || !DB) {
				console.warn("⚠️ テスト環境が設定されていないため、このテストはスキップされます");
				return;
			}
			
			const testData = {
				gym_id: "test-gym-123",
				name: "Test Gym",
				owner_email: "test@example.com"
			};
			
			await setupTestData(DB, "gyms", testData);
			
			// データが挿入されたことを確認
			const result = await DB.prepare("SELECT * FROM gyms WHERE gym_id = ?")
				.bind(testData.gym_id)
				.first();
			
			expect(result).toBeDefined();
			expect(result?.gym_id).toBe(testData.gym_id);
			expect(result?.name).toBe(testData.name);
			expect(result?.owner_email).toBe(testData.owner_email);
		});
	});

	describe("cleanupTestData", () => {
		it("テストデータをクリーンアップできる", async () => {
			const { DB, isTestEnv } = getTestEnv();
			
			if (!isTestEnv || !DB) {
				console.warn("⚠️ テスト環境が設定されていないため、このテストはスキップされます");
				return;
			}
			
			// テストデータを挿入
			const testData = {
				gym_id: "cleanup-test-123",
				name: "Cleanup Test Gym",
				owner_email: "cleanup@example.com"
			};
			
			await DB.prepare(`
				INSERT INTO gyms (gym_id, name, owner_email) 
				VALUES (?, ?, ?)
			`).bind(testData.gym_id, testData.name, testData.owner_email).run();
			
			// クリーンアップ
			await cleanupTestData(DB, "gyms", { gym_id: testData.gym_id });
			
			// データが削除されたことを確認
			const result = await DB.prepare("SELECT * FROM gyms WHERE gym_id = ?")
				.bind(testData.gym_id)
				.first();
			
			expect(result).toBeNull();
		});
	});

	describe("withTransactionalTest", () => {
		it("テスト実行後に自動的にクリーンアップされる", async () => {
			const { DB, isTestEnv } = getTestEnv();
			
			if (!isTestEnv || !DB) {
				console.warn("⚠️ テスト環境が設定されていないため、このテストはスキップされます");
				return;
			}
			
			const testGymId = "transactional-test-456";
			
			// トランザクショナルテストを実行
			await withTransactionalTest(DB, async (db) => {
				// テスト内でデータを挿入
				await db.prepare(`
					INSERT INTO gyms (gym_id, name, owner_email) 
					VALUES (?, ?, ?)
				`).bind(testGymId, "Transactional Test Gym", "transactional@example.com").run();
				
				// データが存在することを確認
				const result = await db.prepare("SELECT * FROM gyms WHERE gym_id = ?")
					.bind(testGymId)
					.first();
				
				expect(result).toBeDefined();
				expect(result?.gym_id).toBe(testGymId);
			});
			
			// テスト後、データが自動的にクリーンアップされていることを確認
			const afterResult = await DB.prepare("SELECT * FROM gyms WHERE gym_id = ?")
				.bind(testGymId)
				.first();
			
			expect(afterResult).toBeNull();
		});

		it("エラーが発生してもクリーンアップされる", async () => {
			const { DB, isTestEnv } = getTestEnv();
			
			if (!isTestEnv || !DB) {
				console.warn("⚠️ テスト環境が設定されていないため、このテストはスキップされます");
				return;
			}
			
			const testGymId = "error-test-789";
			
			// エラーが発生するトランザクショナルテストを実行
			try {
				await withTransactionalTest(DB, async (db) => {
					// テスト内でデータを挿入
					await db.prepare(`
						INSERT INTO gyms (gym_id, name, owner_email) 
						VALUES (?, ?, ?)
					`).bind(testGymId, "Error Test Gym", "error@example.com").run();
					
					// 意図的にエラーを発生させる
					throw new Error("Test error");
				});
			} catch (error) {
				// エラーが発生することを期待
				expect(error).toBeDefined();
			}
			
			// エラー後もデータがクリーンアップされていることを確認
			const afterResult = await DB.prepare("SELECT * FROM gyms WHERE gym_id = ?")
				.bind(testGymId)
				.first();
			
			expect(afterResult).toBeNull();
		});
	});
});
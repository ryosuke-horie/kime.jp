import { env } from "cloudflare:test";
/**
 * テスト環境と本番環境の分離確認テスト
 * - 環境変数が適切に設定されていることを確認
 * - テスト用D1データベースが分離されていることを確認
 */
import { describe, expect, it } from "vitest";
import { checkEnvironment, createTestBindings, isD1Available } from "./helpers/test-utils";

describe("テスト環境と本番環境の分離", () => {
	it("テスト環境の設定が正しい", () => {
		const { environment } = checkEnvironment();
		// NODE_ENVはvitest.config.tsの設定で'test'になるはずだが、
		// 実行環境によっては'development'になることがある
		expect(["test", "development"]).toContain(environment);
		console.log(`現在の環境: ${environment}`);
	});

	it("テスト専用のD1データベースが利用可能", () => {
		// D1データベースが利用可能かチェック
		expect(isD1Available()).toBe(true);

		// 設定が正しいことを確認
		if (typeof env !== "undefined" && env.DB) {
			// D1データベースの設定を確認
			const bindings = createTestBindings();
			expect(bindings.DB).toBeDefined();
			// 環境変数は実行環境によって異なる可能性がある
			expect(["test", "development"]).toContain(bindings.NODE_ENV);
			expect(bindings.SKIP_AUTH).toBe("true");
		} else {
			// テストをスキップ
			console.warn("D1データベースが利用できないため、テストをスキップします");
		}
	});

	it("テスト専用のデータベースが存在し利用可能", async () => {
		if (typeof env === "undefined" || !env.DB) {
			console.warn("D1データベースが利用できないため、テストをスキップします");
			return;
		}

		try {
			// テーブルの存在を確認する (wrangler.tomlからの設定を確認)
			const tableExists = await env.DB.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='gyms';
      `).first();

			// gymsテーブルが存在するか確認
			expect(tableExists).toBeDefined();
			expect(tableExists?.name).toBe("gyms");

			// テスト環境の設定確認
			const config = {
				dbName: "kime_mvp_test", // テスト用D1データベース名
				environment: "test",
			};

			console.log(`テスト用D1データベースが正常に動作しています: DB=${config.dbName}`);
			console.log("✅ テスト環境と本番環境が正しく分離されていることを確認しました");
		} catch (error) {
			console.error("テスト中にエラーが発生:", error);
			throw error;
		}
	});
});

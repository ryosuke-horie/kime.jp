/// <reference path="../../worker-configuration.d.ts" />
/// <reference path="../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach } from "vitest";
import { seedGymDataFromBindings } from "./fixtures/gym-fixtures";
import { validateFixturesAgainstDb } from "./helpers/fixture-generator";
import { isD1Available } from "./helpers/skippable-test";

/**
 * テスト全体の前に一度だけ実行される処理
 */
beforeAll(async () => {
	if (!isD1Available()) return;

	console.log("テスト環境をセットアップしています...");

	try {
		// テーブルをクリーンアップして初期状態にする
		await cleanupTables();

		// テストデータを挿入
		await seedGymDataFromBindings();

		// フィクスチャとDBスキーマの整合性チェック（問題があれば警告）
		if (env?.DB) {
			const tables = await env.DB.prepare(
				"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
			).all();

			for (const table of (tables.results || []) as { name: string }[]) {
				const errors = await validateFixturesAgainstDb(env.DB, table.name, []);

				if (errors.length > 0) {
					console.warn(`"${table.name}"テーブルの整合性チェックで問題が検出されました:`, errors);
				}
			}
		}

		console.log("テスト環境のセットアップが完了しました");
	} catch (error) {
		console.error("テスト環境のセットアップに失敗しました:", error);
		throw error;
	}
});

/**
 * 各テストケースの前に毎回実行される処理
 */
beforeEach(async () => {
	if (!isD1Available()) return;

	try {
		// 各テストでデータを初期状態にリセット
		await cleanupTables();
		await seedGymDataFromBindings();
	} catch (error) {
		console.error("テストケースの初期化に失敗しました:", error);
	}
});

/**
 * テスト全体の後に一度だけ実行される処理
 */
afterAll(async () => {
	if (!isD1Available()) return;

	console.log("テスト環境をクリーンアップしています...");

	try {
		// テーブルをクリーンアップ
		await cleanupTables();
		console.log("テスト環境のクリーンアップが完了しました");
	} catch (error) {
		console.error("テスト環境のクリーンアップに失敗しました:", error);
	}
});

/**
 * 全テーブルのデータをクリーンアップ
 */
async function cleanupTables() {
	if (!env?.DB) return;

	try {
		// テーブル一覧を取得
		const tables = await env.DB.prepare(
			"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
		).all();

		// 外部キー制約を一時的に無効化
		await env.DB.prepare("PRAGMA foreign_keys = OFF").run();

		// 各テーブルを空にする
		for (const table of (tables.results || []) as { name: string }[]) {
			await env.DB.prepare(`DELETE FROM ${table.name}`).run();
		}

		// 外部キー制約を再度有効化
		await env.DB.prepare("PRAGMA foreign_keys = ON").run();
	} catch (error) {
		console.error("テーブルのクリーンアップに失敗しました:", error);
		throw error;
	}
}

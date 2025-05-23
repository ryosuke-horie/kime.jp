import { env } from "cloudflare:test";
/**
 * テスト環境のセットアップスクリプト
 * - D1データベースの初期化
 * - テスト用テーブルの作成
 * - データのクリーンアップ
 */
import { drizzle } from "drizzle-orm/d1";
/// <reference types="vitest" />
/// <reference types="miniflare" />
/// <reference path="../../worker-configuration.d.ts" />
/// <reference path="../types/cloudflare-test.d.ts" />
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { gyms } from "../db/schema";
import { gymFixtures } from "./fixtures/gym-fixtures";

/**
 * テスト環境の変数を取得するユーティリティ
 * @returns D1データベースへのアクセスを提供するオブジェクト
 */
function getTestEnv() {
	return {
		DB: env?.DB,
		isTestEnv: typeof env !== "undefined" && env.DB !== undefined,
	};
}

/**
 * テスト用テーブルを作成する関数
 * @param db D1データベースインスタンス
 */
async function createTestTables(db: D1Database): Promise<void> {
	try {
		// マイグレーションベースのアプローチに移行したため、
		// この関数では直接テーブルを作成しない
		// 代わりに、マイグレーションランナーを使用
		const { applyMigrationsToTestDB } = await import("./helpers/migration-runner");
		const result = await applyMigrationsToTestDB(db);
		
		if (!result.success) {
			throw new Error("Failed to apply migrations");
		}

		console.log("✅ Test tables created successfully via migrations");
	} catch (error) {
		console.error("❌ Failed to create test tables:", error);
		throw error;
	}
}

/**
 * テスト用のサンプルデータを挿入する関数
 * @param db D1データベースインスタンス
 */
async function seedTestData(db: D1Database): Promise<void> {
	try {
		// まず、テーブルの存在を確認
		const tableExists = await db
			.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='gyms';
    `)
			.first();

		if (!tableExists) {
			console.warn("⚠️ gymsテーブルが存在しません。先にテーブルを作成します。");
			await createTestTables(db);
		}

		// テストデータの挿入 - フィクスチャーデータを使用
		for (const fixture of gymFixtures) {
			await db.exec(
				`INSERT OR IGNORE INTO gyms (gym_id, name, owner_email, created_at, updated_at) VALUES ('${fixture.gymId}', '${fixture.name}', '${fixture.ownerEmail}', '${fixture.createdAt || new Date().toISOString()}', '${fixture.updatedAt || new Date().toISOString()}');`,
			);
		}

		console.log("✅ Test data seeded successfully");
	} catch (error) {
		console.error("❌ Failed to seed test data:", error);
		throw error;
	}
}

/**
 * データベースのデータをクリーンアップする関数
 * @param db D1データベースインスタンス
 */
async function cleanupData(db: D1Database): Promise<void> {
	try {
		// テーブルの存在を確認してからデータを削除
		const tables = ["admin_gym_relationships", "admin_accounts", "gyms"];

		for (const table of tables) {
			try {
				// テーブルが存在するか確認してから削除
				const result = await db
					.prepare(`
          SELECT name FROM sqlite_master WHERE type='table' AND name=?;
        `)
					.bind(table)
					.first();

				if (result) {
					await db.exec(`DELETE FROM ${table}`);
				}
			} catch (err) {
				console.warn(`⚠️ Table '${table}' might not exist yet, skipping cleanup`);
			}
		}

		console.log("✅ Database data cleaned up");
	} catch (error) {
		console.error("❌ Failed to clean database data:", error);
		throw error;
	}
}

/**
 * テスト終了時にテーブルを削除する関数
 * @param db D1データベースインスタンス
 */
async function dropTestTables(db: D1Database): Promise<void> {
	try {
		// マイグレーションランナーのリセット機能を使用
		const { resetTestDatabase } = await import("./helpers/migration-runner");
		await resetTestDatabase(db);
	} catch (error) {
		console.error("❌ Failed to drop test tables:", error);
		throw error;
	}
}

/**
 * テスト環境の初期化処理
 * - テスト用テーブルの作成
 * - 基本的なテストデータの挿入
 */
beforeAll(async () => {
	const { DB, isTestEnv } = getTestEnv();

	if (!isTestEnv || !DB) {
		console.warn("⚠️ Test environment is not properly set up. Tests requiring D1 may fail.");
		return;
	}

	try {
		// 既存のテーブルをクリーンアップ（マイグレーションとの競合を避けるため）
		await dropTestTables(DB);
		
		// テスト用のテーブルを作成
		await createTestTables(DB);

		// 初期テストデータを挿入
		await seedTestData(DB);

		console.log("✅ Test environment initialized successfully");
	} catch (error) {
		console.error("❌ Failed to initialize test environment:", error);
	}
});

/**
 * 各テスト実行前のセットアップ
 * - 既存データのクリーンアップ
 * - 基本的なテストデータの再挿入
 */
beforeEach(async () => {
	const { DB, isTestEnv } = getTestEnv();

	if (!isTestEnv || !DB) return;

	try {
		// テストデータをクリーンアップ
		await cleanupData(DB);

		// 基本的なテストデータを再挿入
		await seedTestData(DB);
	} catch (error) {
		console.error("❌ Failed to reset test data:", error);
	}
});

/**
 * 各テスト実行後のクリーンアップ
 */
afterEach(async () => {
	// 特別なクリーンアップが必要な場合はここに追加
});

/**
 * すべてのテスト終了後のクリーンアップ処理
 * - テーブルの削除
 * - リソースの解放
 */
afterAll(async () => {
	const { DB, isTestEnv } = getTestEnv();

	if (!isTestEnv || !DB) return;

	try {
		// テスト終了時にテーブルを削除
		await dropTestTables(DB);

		console.log("✅ Test environment cleaned up successfully");
	} catch (error) {
		console.error("❌ Failed to cleanup test environment:", error);
	}
});

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
	const isTestEnv = typeof env !== "undefined" && env.DB !== undefined;
	const nodeEnv = process.env.NODE_ENV;

	if (isTestEnv) {
		console.log(`📋 Test environment detected: NODE_ENV=${nodeEnv}`);
	}

	return {
		DB: env?.DB,
		isTestEnv,
		nodeEnv,
	};
}

/**
 * データベース接続を確認する関数
 * @param db D1データベースインスタンス
 */
async function verifyDatabaseConnection(db: D1Database): Promise<void> {
	try {
		// 簡単なクエリでデータベース接続を確認
		await db.prepare("SELECT 1 as test").first();
		console.log("✅ Database connection verified");
	} catch (error) {
		console.error("❌ Database connection failed:", error);
		throw new Error("Database connection verification failed");
	}
}

/**
 * テスト用テーブルを作成する関数
 * @param db D1データベースインスタンス
 */
async function createTestTables(db: D1Database): Promise<void> {
	try {
		console.log("🔧 Creating test tables...");

		// データベース接続を最初に確認
		await verifyDatabaseConnection(db);

		// gymsテーブルの作成 - SQL文を単純化
		await db.exec(
			"CREATE TABLE IF NOT EXISTS gyms (gym_id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT NOT NULL, password_hash TEXT, phone TEXT, website TEXT, address TEXT, description TEXT, created_at TEXT, updated_at TEXT);",
		);
		console.log("  ✓ gyms table created");

		// adminAccountsテーブルの作成 - SQL文を単純化
		await db.exec(
			"CREATE TABLE IF NOT EXISTS admin_accounts (admin_id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, role TEXT NOT NULL, password_hash TEXT, is_active INTEGER, last_login_at TEXT, created_at TEXT, updated_at TEXT);",
		);
		console.log("  ✓ admin_accounts table created");

		// adminGymRelationshipsテーブルの作成 - SQL文を単純化
		await db.exec(
			"CREATE TABLE IF NOT EXISTS admin_gym_relationships (admin_id TEXT NOT NULL, gym_id TEXT NOT NULL, role TEXT NOT NULL, created_at TEXT, PRIMARY KEY (admin_id, gym_id));",
		);
		console.log("  ✓ admin_gym_relationships table created");

		// staffテーブルの作成
		await db.exec(
			"CREATE TABLE IF NOT EXISTS staff (staff_id TEXT PRIMARY KEY, gym_id TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, password_hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, last_login_at TEXT, created_at TEXT);",
		);
		console.log("  ✓ staff table created");

		console.log("✅ Test tables created successfully");
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

		// スタッフテストデータを挿入 - PBKDF2ハッシュを使用
		const pbkdf2Hash = "vQ+08EWS3Aoo8A4Q0JVk1A==:Du0SUOrY+warqJA4nluv7pb6dzq6C3nOD9UFq+bIhMs="; // password123
		const staffInserts = [
			`INSERT OR IGNORE INTO staff (staff_id, gym_id, name, email, role, password_hash, active, created_at) VALUES ('staff-1', 'gym-1', 'スタッフ太郎', 'staff@test.com', 'reception', '${pbkdf2Hash}', 1, '2023-01-01T00:00:00.000Z');`,
			`INSERT OR IGNORE INTO staff (staff_id, gym_id, name, email, role, password_hash, active, created_at) VALUES ('owner-1', 'gym-1', 'オーナー花子', 'owner@test.com', 'admin', '${pbkdf2Hash}', 1, '2023-01-01T00:00:00.000Z');`,
			`INSERT OR IGNORE INTO staff (staff_id, gym_id, name, email, role, password_hash, active, created_at) VALUES ('staff-2', 'gym-1', 'スタッフ次郎', 'staff2@test.com', 'reception', '${pbkdf2Hash}', 1, '2023-01-01T00:00:00.000Z');`,
			`INSERT OR IGNORE INTO staff (staff_id, gym_id, name, email, role, password_hash, active, created_at) VALUES ('staff-inactive', 'gym-1', '非アクティブスタッフ', 'inactive@test.com', 'reception', '${pbkdf2Hash}', 0, '2023-01-01T00:00:00.000Z');`,
			`INSERT OR IGNORE INTO staff (staff_id, gym_id, name, email, role, password_hash, active, created_at) VALUES ('staff-gym2', 'gym-2', 'ジム2スタッフ', 'staff-gym2@test.com', 'reception', '${pbkdf2Hash}', 1, '2023-01-02T00:00:00.000Z');`,
		];

		for (const sql of staffInserts) {
			await db.exec(sql);
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
		console.log("🧹 Cleaning up test data...");

		// テーブルの存在を確認してからデータを削除
		// 参照整合性を考慮した順序で削除
		const tables = ["staff", "admin_gym_relationships", "admin_accounts", "gyms"];
		let cleanedTables = 0;

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
					const deleteResult = await db.exec(`DELETE FROM ${table}`);
					console.log(`  ✓ ${table} table data cleared`);
					cleanedTables++;
				}
			} catch (err) {
				console.warn(`⚠️ Table '${table}' might not exist yet, skipping cleanup`);
			}
		}

		console.log(`✅ Database data cleaned up (${cleanedTables} tables processed)`);
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
		// 参照整合性の制約があるので、順番に削除
		const tablesToDrop = ["staff", "admin_gym_relationships", "admin_accounts", gyms.name];

		for (const table of tablesToDrop) {
			try {
				await db.exec(`DROP TABLE IF EXISTS ${table}`);
			} catch (err) {
				console.warn(`⚠️ Could not drop table ${table}, it might not exist`);
			}
		}

		console.log("✅ Test tables dropped successfully");
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

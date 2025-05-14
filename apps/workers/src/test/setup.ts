/// <reference types="vitest" />
/// <reference types="miniflare" />
import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { Miniflare } from "miniflare";
import { drizzle } from "drizzle-orm/d1";
import { migrate } from "drizzle-orm/d1/migrator";
import { gyms } from "../db/schema";

/**
 * Miniflareインスタンスとテスト用D1データベースをセットアップするためのグローバル変数
 */
declare global {
	// eslint-disable-next-line no-var
	var testMiniflare: Miniflare;
	// eslint-disable-next-line no-var
	var testDb: D1Database;
}

/**
 * テスト前の初期セットアップを行う
 * - Miniflareインスタンスの作成
 * - D1データベースの初期化
 * - テスト用のテーブル作成
 */
beforeAll(async () => {
	// Miniflareインスタンスを作成
	const miniflare = new Miniflare({
		modules: true,
		d1Databases: ["DB"],
		d1Persist: false, // テスト間でデータを永続化しない
	});

	// D1データベースを取得
	const d1 = await miniflare.getD1Database("DB");

	// Drizzle ORMを初期化
	const db = drizzle(d1);

	// マイグレーションの代わりに直接テーブルを作成
	// 本番環境のマイグレーションファイルを使用する場合は次のようにする:
	// await migrate(db, { migrationsFolder: "./migrations" });
	await d1.exec(`
    CREATE TABLE IF NOT EXISTS gyms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_email TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

	// グローバル変数として設定
	globalThis.testMiniflare = miniflare;
	globalThis.testDb = d1;
});

/**
 * 各テスト前にデータをクリーンアップする
 */
beforeEach(async () => {
	// テーブルのデータをクリア
	await globalThis.testDb.exec(`DELETE FROM ${gyms.name}`);
});

/**
 * すべてのテスト終了後にクリーンアップする
 */
afterAll(async () => {
	// テーブルの削除
	await globalThis.testDb.exec(`DROP TABLE IF EXISTS ${gyms.name}`);
});
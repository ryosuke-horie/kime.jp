/// <reference types="vitest" />
/// <reference types="miniflare" />
/// <reference path="../../worker-configuration.d.ts" />
import { beforeAll, beforeEach, afterAll, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/d1";
import { gyms } from "../db/schema";

/**
 * テスト環境のグローバル変数の定義
 */
declare global {
	// eslint-disable-next-line no-var
	var DB: D1Database;
}

/**
 * 未定義のテスト用コンテキストを扱うための型ガード
 */
function isTestEnv(): boolean {
	return typeof globalThis.DB !== 'undefined';
}

/**
 * テスト前の初期セットアップを行う
 * - D1データベースの初期化
 * - テスト用のテーブル作成
 */
beforeAll(async () => {
	if (!isTestEnv()) {
		console.warn('Test environment is not properly set up. Tests requiring D1 may fail.');
		return;
	}

	try {
		// マイグレーションの代わりに直接テーブルを作成
		await globalThis.DB.exec(`
      CREATE TABLE IF NOT EXISTS gyms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        owner_email TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
		console.log('Test database initialized successfully');
	} catch (error) {
		console.error('Failed to initialize test database:', error);
	}
});

/**
 * 各テスト前にデータをクリーンアップする
 */
beforeEach(async () => {
	if (!isTestEnv()) return;
	
	try {
		// テーブルのデータをクリア
		await globalThis.DB.exec(`DELETE FROM ${gyms.name}`);
	} catch (error) {
		console.error('Failed to clean test data:', error);
	}
});

/**
 * 各テスト後のクリーンアップ
 */
afterEach(() => {
	// 必要に応じてリソースをクリーンアップ
});

/**
 * すべてのテスト終了後にクリーンアップする
 */
afterAll(async () => {
	if (!isTestEnv()) return;
	
	try {
		// テーブルの削除
		await globalThis.DB.exec(`DROP TABLE IF EXISTS ${gyms.name}`);
		console.log('Test database cleaned up');
	} catch (error) {
		console.error('Failed to cleanup test database:', error);
	}
});
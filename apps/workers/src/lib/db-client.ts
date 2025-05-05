import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db";

/**
 * D1データベースのDrizzleクライアントを初期化する
 *
 * @param db Cloudflare D1 Database
 * @returns Drizzleクライアントインスタンス
 */
export function createD1Client(db: D1Database) {
	return drizzle(db, { schema });
}

/**
 * Durable Object内で使用するストレージに接続するDrizzleクライアントを初期化する
 * （将来的な実装）
 *
 * @param storage Durable Object storage
 * @returns Drizzleクライアントインスタンス
 */
export function createDOClient(_storage: DurableObjectStorage) {
	// TODO: Durable Object storage用のDrizzleアダプターが必要
	// 現在はDOStorage → Drizzleの直接アダプターはないため、
	// D1を経由するか独自実装が必要

	// このメソッドは将来的な拡張用のプレースホルダーです
	throw new Error("Durable Object Storage用Drizzleクライアントは未実装です");
}

// ユーティリティ関数: UUIDを生成する
export function generateUUID(): string {
	return crypto.randomUUID();
}

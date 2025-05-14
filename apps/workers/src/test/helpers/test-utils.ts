import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import type { CloudflareBindings } from "../../index";
import { env } from "cloudflare:test";

/**
 * テスト用のHonoアプリケーションを作成するユーティリティ関数
 * 
 * @param app テスト対象のHonoアプリケーション
 * @returns テスト用の設定を含むHonoアプリケーション
 */
export function createTestApp(app: Hono<{ Bindings: CloudflareBindings }>): Hono<{ Bindings: CloudflareBindings }> {
	return app;
}

/**
 * テスト用のCloudflareバインディングを作成するユーティリティ関数
 * 
 * @returns Cloudflareバインディングを含むオブジェクト
 */
export function createTestBindings(): CloudflareBindings {
	if (typeof env !== "undefined" && env.DB) {
		return {
			DB: env.DB,
		};
	}
	throw new Error("D1 database is not available in test environment");
}

/**
 * テスト用のdrizzleインスタンスを作成するユーティリティ関数
 * 
 * @returns drizzleインスタンス
 */
export function createTestDb() {
	if (typeof env !== "undefined" && env.DB) {
		return drizzle(env.DB);
	}
	throw new Error("D1 database is not available in test environment");
}

/**
 * テスト用のリクエストを作成するユーティリティ関数
 * 
 * @param path リクエストパス
 * @param options リクエストオプション
 * @returns Requestオブジェクト
 */
export function createTestRequest(
	path: string,
	options?: {
		method?: string;
		headers?: Record<string, string>;
		body?: Record<string, unknown>;
	}
) {
	const url = new URL(path, "http://localhost");
	const init: RequestInit = {
		method: options?.method || "GET",
		headers: options?.headers || {},
	};

	if (options?.body) {
		init.body = JSON.stringify(options.body);
		init.headers = {
			...init.headers,
			"Content-Type": "application/json",
		};
	}

	return new Request(url, init);
}
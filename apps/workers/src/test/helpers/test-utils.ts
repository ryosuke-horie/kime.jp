/// <reference path="../../../worker-configuration.d.ts" />
/// <reference path="../../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";
import type { Hono } from "hono";

/**
 * テスト用のHonoアプリケーションを作成するユーティリティ関数
 *
 * @param app テスト対象のHonoアプリケーション
 * @returns テスト用の設定を含むHonoアプリケーション
 */
export function createTestApp(
	app: Hono<{ Bindings: Cloudflare.Env }>,
): Hono<{ Bindings: Cloudflare.Env }> {
	return app;
}

/**
 * テスト用のCloudflareバインディングを作成するユーティリティ関数
 *
 * @returns Cloudflareバインディングを含むオブジェクト
 */
export function createTestBindings(): Cloudflare.Env {
	if (typeof env !== "undefined" && env.DB) {
		return {
			DB: env.DB,
			NODE_ENV: env.NODE_ENV || "test",
			SKIP_AUTH: env.SKIP_AUTH || "true",
			JWT_SECRET: env.JWT_SECRET || "test-secret",
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
	},
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

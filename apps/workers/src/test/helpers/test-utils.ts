/// <reference path="../../../worker-configuration.d.ts" />
/// <reference path="../../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";
import type { Hono } from "hono";
import { it } from "vitest";

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
 * D1データベーステストの前処理を実行するヘルパー関数
 * beforeEachブロック内で使用することを想定
 *
 * @param setupFn データベース利用可能時に実行するセットアップ関数
 * @example
 * beforeEach(async () => {
 *   await setupD1Test(async () => {
 *     // テストデータのセットアップなど
 *   });
 * });
 */
export async function setupD1Test(setupFn?: () => Promise<void>): Promise<void> {
	if (!isD1Available()) return;

	if (setupFn) {
		await setupFn();
	}
}

/**
 * D1データベーステストの後処理を実行するヘルパー関数
 * afterEachブロック内で使用することを想定
 *
 * @param cleanupFn データベース利用可能時に実行するクリーンアップ関数
 * @example
 * afterEach(async () => {
 *   await cleanupD1Test(async () => {
 *     // テストデータのクリーンアップなど
 *   });
 * });
 */
export async function cleanupD1Test(cleanupFn?: () => Promise<void>): Promise<void> {
	if (!isD1Available()) return;

	if (cleanupFn) {
		await cleanupFn();
	}
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

/**
 * テスト環境がD1データベースをサポートしているかを確認するヘルパー関数
 * @returns D1データベースが利用可能かどうか
 */
export function isD1Available(): boolean {
	if (typeof env === "undefined" || !env.DB) {
		console.warn("Skipping D1 database tests - env.DB is not available");
		return false;
	}
	return true;
}

/**
 * D1データベースが必要なテストのためのヘルパー関数
 * D1が利用できない場合は自動的にスキップする
 */
export function itWithD1(name: string, fn: () => Promise<void>) {
	it(name, async () => {
		if (!isD1Available()) return;
		await fn();
	});
}

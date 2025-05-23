/**
 * テスト用ユーティリティ関数群
 * - D1データベース操作
 * - テスト環境確認
 * - テストリクエスト生成
 * - テストヘルパー
 */
/// <reference path="../../../worker-configuration.d.ts" />
/// <reference path="../../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";
import type { Hono } from "hono";
import { describe, it } from "vitest";
import * as schema from "../../db/schema";
import { TEST_ENV_CONFIG } from "../test-env-config";

/**
 * テスト環境の変数を取得するユーティリティ
 * @returns テスト環境情報
 */
export function getTestEnv() {
	return {
		DB: env?.DB,
		isTestEnv: typeof env !== "undefined" && env.DB !== undefined,
		NODE_ENV: env?.NODE_ENV || TEST_ENV_CONFIG.NODE_ENV,
		SKIP_AUTH: env?.SKIP_AUTH || TEST_ENV_CONFIG.SKIP_AUTH,
		JWT_SECRET: env?.JWT_SECRET || TEST_ENV_CONFIG.JWT_SECRET,
	};
}

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
	const { DB, NODE_ENV, SKIP_AUTH, JWT_SECRET, isTestEnv } = getTestEnv();

	if (isTestEnv && DB) {
		return {
			DB,
			NODE_ENV,
			SKIP_AUTH,
			JWT_SECRET,
		};
	}

	throw new Error("テスト環境が正しく設定されていません。pnpm test:setup を実行してください。");
}

/**
 * テスト用のdrizzleインスタンスを作成するユーティリティ関数
 *
 * @returns drizzleインスタンス
 */
export function createTestDb() {
	const { DB, isTestEnv } = getTestEnv();

	if (isTestEnv && DB) {
		return drizzle(DB, { schema });
	}

	throw new Error("テスト環境が正しく設定されていません。pnpm test:setup を実行してください。");
}

/**
 * 現在の環境がテスト環境か本番環境かを確認するユーティリティ
 * @returns 環境情報
 */
export function checkEnvironment() {
	const { NODE_ENV, isTestEnv } = getTestEnv();

	return {
		isTest: NODE_ENV === "test" && isTestEnv,
		isProd: NODE_ENV === "production",
		isDev: NODE_ENV === "development" || NODE_ENV === undefined,
		environment: NODE_ENV || "development",
	};
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
	if (!isD1Available()) {
		console.warn("⚠️ D1データベースが利用できないため、テストセットアップをスキップします");
		return;
	}

	if (setupFn) {
		try {
			await setupFn();
		} catch (error) {
			console.error("❌ テストセットアップ中にエラーが発生しました:", error);
			throw error;
		}
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
	if (!isD1Available()) {
		console.warn("⚠️ D1データベースが利用できないため、テストクリーンアップをスキップします");
		return;
	}

	if (cleanupFn) {
		try {
			await cleanupFn();
		} catch (error) {
			console.error("❌ テストクリーンアップ中にエラーが発生しました:", error);
			throw error;
		}
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
): Request {
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
	const { DB } = getTestEnv();

	if (!DB) {
		console.warn("⚠️ D1データベースが利用できません - pnpm test:setup を実行してください");
		return false;
	}

	return true;
}

/**
 * D1データベースが必要なテストを実行するヘルパー関数
 * D1が利用できない場合は自動的にスキップする
 */
export function itWithD1(name: string, fn: () => Promise<void>) {
	it(name, async () => {
		if (!isD1Available()) {
			console.warn(`⚠️ テスト "${name}" は D1 データベースが必要なためスキップします`);
			return;
		}
		await fn();
	});
}

/**
 * D1データベースが必要なテストスイートを実行するヘルパー関数
 * D1が利用できない場合は自動的にスキップする
 */
export function describeWithD1(name: string, fn: () => void) {
	describe(name, () => {
		if (!isD1Available()) {
			it.todo(`⚠️ D1 データベースが利用できないため、テストスイート "${name}" はスキップします`);
			return;
		}
		fn();
	});
}

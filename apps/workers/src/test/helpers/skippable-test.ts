/// <reference path="../../../worker-configuration.d.ts" />
/// <reference path="../../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";
import { it } from "vitest";

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

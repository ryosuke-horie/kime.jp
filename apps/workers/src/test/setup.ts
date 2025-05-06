// Vitestのセットアップファイル
// テスト環境の共通設定を行います

import { afterAll, beforeAll, vi } from "vitest";
import { z } from "zod";

// Zodを拡張して、OpenAPIメタデータ追加メソッドをモック
// 実際の実装は使用せず、テスト用にOpenAPI機能をシミュレート
// Zodオブジェクトにプロパティを追加するのではなく、プロトタイプにメソッドを追加する方法を取る

// OpenAPIメソッドをZod型に追加するモック関数
// @ts-ignore - プロトタイプを拡張するため
z.ZodType.prototype.openapi = function (options: Record<string, unknown>) {
	return this;
};

// readFileSyncの代替実装を提供
vi.mock("node:fs", () => ({
	readFileSync: vi.fn(),
}));

// D1データベースのモック
vi.mock("drizzle-orm/d1", () => {
	return {
		drizzle: vi.fn().mockImplementation(() => ({
			select: vi.fn().mockReturnThis(),
			from: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			get: vi.fn().mockResolvedValue({}),
			all: vi.fn().mockResolvedValue([]),
			execute: vi.fn().mockResolvedValue([]),
			insert: vi.fn().mockReturnThis(),
			values: vi.fn().mockResolvedValue({}),
			update: vi.fn().mockReturnThis(),
			set: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis(),
			fn: {
				count: vi.fn().mockReturnValue("count"),
			},
		})),
	};
});

// グローバルモック設定
beforeAll(() => {
	// テスト環境のグローバル設定
	console.log("Test setup initialized");
});

afterAll(() => {
	// テスト終了時の後片付け
	vi.resetAllMocks();
});

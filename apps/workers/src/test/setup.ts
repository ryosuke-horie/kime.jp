// Vitestのセットアップファイル
// テスト環境の共通設定を行います

import { afterAll, beforeAll, vi } from "vitest";

// readFileSyncの代替実装を提供
vi.mock("node:fs", () => ({
	readFileSync: vi.fn(),
}));

// グローバルモック設定
beforeAll(() => {
	// テスト環境のグローバル設定
	console.log("Test setup initialized");
});

afterAll(() => {
	// テスト終了時の後片付け
	vi.resetAllMocks();
});

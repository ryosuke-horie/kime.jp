// テスト環境セットアップ
import { afterAll, beforeAll } from "vitest";

// テスト前の共通処理
beforeAll(() => {
	console.log("Web test setup initialized");
});

// テスト後のクリーンアップ
afterAll(() => {
	console.log("Web test cleanup complete");
});

/**
 * MSWサーバーセットアップ
 * テスト環境でAPIリクエストをインターセプトするためのモックサーバー設定
 */
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// テスト環境用のMSWサーバーを作成
export const server = setupServer(...handlers);

// @ts-expect-error - vitest provides this property
if (import.meta.vitest) {
	// @ts-expect-error - vitest provides this property
	const { test, expect } = import.meta.vitest;

	test("MSWサーバーが正しく初期化される", () => {
		expect(server).toBeDefined();
		expect(typeof server.listen).toBe("function");
		expect(typeof server.close).toBe("function");
		expect(typeof server.resetHandlers).toBe("function");
	});
}

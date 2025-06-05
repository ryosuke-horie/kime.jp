/**
 * MSWサーバーセットアップ
 * テスト環境でAPIリクエストをインターセプトするためのモックサーバー設定
 */
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// テスト環境用のMSWサーバーを作成
export const server = setupServer(...handlers);

// サーバーの状態を追跡
let isServerRunning = false;

// サーバーの安全な開始
export const startServer = () => {
	if (!isServerRunning) {
		server.listen({
			onUnhandledRequest: "bypass",
		});
		isServerRunning = true;
		console.log("MSW server started");
	}
};

// サーバーの安全な停止
export const stopServer = () => {
	if (isServerRunning) {
		server.close();
		isServerRunning = false;
		console.log("MSW server stopped");
	}
};

// サーバーのリセット
export const resetServer = () => {
	if (isServerRunning) {
		server.resetHandlers();
		console.log("MSW server handlers reset");
	}
};

// サーバーの状態確認
export const isRunning = () => isServerRunning;

// @ts-expect-error - vitest provides this property
if (import.meta.vitest) {
	// @ts-expect-error - vitest provides this property
	const { test, expect } = import.meta.vitest;

	test("MSWサーバーが正しく初期化される", () => {
		expect(server).toBeDefined();
		expect(typeof server.listen).toBe("function");
		expect(typeof server.close).toBe("function");
		expect(typeof server.resetHandlers).toBe("function");
		expect(typeof startServer).toBe("function");
		expect(typeof stopServer).toBe("function");
		expect(typeof resetServer).toBe("function");
		expect(typeof isRunning).toBe("function");
	});
}

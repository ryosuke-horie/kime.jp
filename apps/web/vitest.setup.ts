import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import "whatwg-fetch";

// MSW サーバーセットアップ（条件付き）
let server: any = null;

beforeAll(async () => {
	// Web API ポリフィルの初期化
	if (typeof global.ReadableStream === "undefined") {
		try {
			const streams = await import("node:stream/web");
			global.ReadableStream = streams.ReadableStream;
			global.WritableStream = streams.WritableStream;
			global.TransformStream = streams.TransformStream;
		} catch (error) {
			console.warn("Failed to import Web Streams API polyfill:", error);
		}
	}

	// Request/Response API ポリフィル（MSW用）
	if (typeof global.Request === "undefined") {
		try {
			const undici = await import("undici");
			global.Request = undici.Request;
			global.Response = undici.Response;
			global.Headers = undici.Headers;
		} catch (error) {
			console.warn("Failed to import undici polyfill:", error);
		}
	}

	// MSWが有効な場合のみ初期化（環境変数で制御）
	if (process.env.DISABLE_MSW !== "true") {
		try {
			const { server: mswServer } = await import("./src/mocks/server");
			server = mswServer;
			server.listen({
				onUnhandledRequest: "bypass",
			});
		} catch (error) {
			console.warn("MSW server could not be initialized:", error);
		}
	}
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
	if (server) {
		server.resetHandlers();
	}
});

// テスト環境用の設定モック
vi.mock("../src/types/index", async () => {
	const actual = (await vi.importActual("../src/types/index")) as any;
	return {
		...actual,
		API_BASE_URL: {
			production: "",
			staging: "",
			development: "",
			test: "",
		},
	};
});

afterAll(() => {
	if (server) {
		server.close();
	}
});

// Web API ポリフィル
import { TextDecoder, TextEncoder } from "node:util";

if (typeof global.TextEncoder === "undefined") {
	global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === "undefined") {
	global.TextDecoder = TextDecoder as any;
}

// グローバル設定
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));

// IntersectionObserverのモック
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
	observe: () => null,
	unobserve: () => null,
	disconnect: () => null,
}));

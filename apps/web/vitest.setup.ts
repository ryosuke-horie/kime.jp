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
			global.ReadableStream = streams.ReadableStream as any;
			global.WritableStream = streams.WritableStream as any;
			global.TransformStream = streams.TransformStream as any;
		} catch (error) {
			console.warn("Failed to import Web Streams API polyfill:", error);
		}
	}

	// Request/Response API ポリフィル（MSW用）
	if (typeof global.Request === "undefined") {
		try {
			const undici = await import("undici");
			global.Request = undici.Request as any;
			global.Response = undici.Response as any;
			global.Headers = undici.Headers as any;
		} catch (error) {
			console.warn("Failed to import undici polyfill:", error);
		}
	}

	// React DOM の初期化確認
	if (typeof window !== "undefined" && typeof document !== "undefined") {
		// JSDOM環境での強制リフレッシュ
		document.body.innerHTML = "";
		console.log("JSDOM environment initialized successfully");
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

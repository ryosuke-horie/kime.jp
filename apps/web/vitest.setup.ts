import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import "whatwg-fetch";

// MSW サーバーセットアップ（条件付き）
let server: any = null;

beforeAll(async () => {
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

// Web Streams API ポリフィル
if (typeof global.ReadableStream === "undefined") {
	const { ReadableStream, WritableStream, TransformStream } = require("node:stream/web");
	global.ReadableStream = ReadableStream;
	global.WritableStream = WritableStream;
	global.TransformStream = TransformStream;
}

// Request/Response API ポリフィル（MSW用）
if (typeof global.Request === "undefined") {
	const { Request, Response, Headers } = require("undici");
	global.Request = Request;
	global.Response = Response;
	global.Headers = Headers;
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

import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

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
	// JSDOM環境ではfetch APIが標準で利用可能
	if (typeof global.Request === "undefined") {
		console.warn("Request API not available - relying on JSDOM fetch implementation");
	}

	// React DOM の初期化確認と環境設定
	if (typeof window !== "undefined" && typeof document !== "undefined") {
		// JSDOM環境での強制リフレッシュ
		document.body.innerHTML = "";

		// React 18 DOM初期化の問題回避
		if (!(global as any).IS_REACT_ACT_ENVIRONMENT) {
			(global as any).IS_REACT_ACT_ENVIRONMENT = true;
		}

		console.log("JSDOM environment initialized successfully");
	}

	// Next.js App Routerのグローバルモック設定
	vi.mock("next/navigation", () => ({
		useRouter: vi.fn(() => ({
			push: vi.fn(),
			replace: vi.fn(),
			back: vi.fn(),
			forward: vi.fn(),
			refresh: vi.fn(),
			prefetch: vi.fn(),
		})),
		useSearchParams: vi.fn(() => ({
			get: vi.fn(),
			has: vi.fn(),
			keys: vi.fn(),
			values: vi.fn(),
			entries: vi.fn(),
			forEach: vi.fn(),
			toString: vi.fn(),
			append: vi.fn(),
			delete: vi.fn(),
			set: vi.fn(),
			sort: vi.fn(),
			size: 0,
			[Symbol.iterator]: vi.fn(),
		})),
		usePathname: vi.fn(() => "/"),
		useParams: vi.fn(() => ({})),
	}));

	// MSWが有効な場合のみ初期化（環境変数で制御）
	if (process.env.DISABLE_MSW !== "true") {
		try {
			const { server: mswServer, startServer } = await import("./src/mocks/server");
			server = mswServer;
			startServer();
		} catch (error) {
			console.warn("MSW server could not be initialized:", error);
		}
	}
});

afterEach(async () => {
	cleanup();
	vi.clearAllMocks();

	// MSWサーバーのリセット
	if (server) {
		try {
			const { resetServer } = await import("./src/mocks/server");
			resetServer();
		} catch (error) {
			console.warn("Failed to reset MSW server:", error);
		}
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

afterAll(async () => {
	// MSWサーバーの安全な停止
	if (server) {
		try {
			const { stopServer } = await import("./src/mocks/server");
			stopServer();
		} catch (error) {
			console.warn("Failed to stop MSW server:", error);
		}
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

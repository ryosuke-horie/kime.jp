import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

// MSWに必要なポリフィルを設定
if (!globalThis.TextEncoder) {
	globalThis.TextEncoder = TextEncoder;
}
if (!globalThis.TextDecoder) {
	globalThis.TextDecoder = TextDecoder;
}
if (!globalThis.TransformStream) {
	// @ts-ignore
	globalThis.TransformStream = require("node:stream/web").TransformStream;
}

// import { server } from './mocks/server'

// MSWサーバーの設定（一時的にコメントアウト）
// beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
	// server.resetHandlers()
	cleanup();
	vi.clearAllMocks();
});
// afterAll(() => server.close())

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

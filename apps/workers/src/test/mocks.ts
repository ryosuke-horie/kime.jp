import { vi } from "vitest";
import type { Env } from "../env";

/**
 * Cloudflare環境のモックを作成する
 */
export const createCloudflareEnvMock = (customMocks = {}): Env => {
	return {
		DB_DO: {
			idFromName: vi.fn().mockReturnValue("test-id"),
			get: vi.fn().mockReturnValue({
				fetch: vi.fn().mockImplementation(async (url) => {
					// URLに基づいてレスポンスを分岐
					const urlObj = new URL(url);
					const path = urlObj.pathname;

					if (path.includes("/get/")) {
						return new Response(
							JSON.stringify({
								success: true,
								data: { id: "test-id", name: "Test Item" },
							}),
						);
					}

					if (path.includes("/list/")) {
						return new Response(
							JSON.stringify({
								success: true,
								data: [{ id: "item1" }, { id: "item2" }],
							}),
						);
					}

					if (path.includes("/create/")) {
						return new Response(
							JSON.stringify({
								success: true,
								id: "new-id",
							}),
						);
					}

					if (path.includes("/update/")) {
						return new Response(
							JSON.stringify({
								success: true,
							}),
						);
					}

					if (path.includes("/delete/")) {
						return new Response(
							JSON.stringify({
								success: true,
							}),
						);
					}

					// デフォルトレスポンス
					return new Response(
						JSON.stringify({
							success: false,
							error: "Not implemented in mock",
						}),
						{ status: 500 },
					);
				}),
			}),
		},
		CLASS_LOCKER: {
			idFromName: vi.fn().mockReturnValue("test-id"),
			get: vi.fn().mockReturnValue({
				fetch: vi.fn().mockImplementation(async (url) => {
					const urlObj = new URL(url);
					const path = urlObj.pathname;

					if (path.includes("/lock/")) {
						return new Response(
							JSON.stringify({
								success: true,
								locked: true,
							}),
						);
					}

					if (path.includes("/unlock/")) {
						return new Response(
							JSON.stringify({
								success: true,
								locked: false,
							}),
						);
					}

					if (path.includes("/check/")) {
						return new Response(
							JSON.stringify({
								success: true,
								locked: false,
							}),
						);
					}

					return new Response(
						JSON.stringify({
							success: false,
							error: "Not implemented in mock",
						}),
						{ status: 500 },
					);
				}),
			}),
		},
		...customMocks,
	} as Env;
};

/**
 * Durable Objectクライアントのモック
 */
export const mockDOClient = vi.fn().mockImplementation(() => ({
	getOne: vi.fn().mockResolvedValue({
		success: true,
		data: { id: "test-id", name: "Test Item" },
	}),
	list: vi.fn().mockResolvedValue({
		success: true,
		data: [{ id: "item1" }, { id: "item2" }],
	}),
	create: vi.fn().mockResolvedValue({
		success: true,
		id: "new-id",
	}),
	update: vi.fn().mockResolvedValue({
		success: true,
	}),
	delete: vi.fn().mockResolvedValue({
		success: true,
	}),
	transaction: vi.fn().mockResolvedValue({
		success: true,
	}),
	query: vi.fn().mockResolvedValue({
		success: true,
		data: [],
	}),
}));

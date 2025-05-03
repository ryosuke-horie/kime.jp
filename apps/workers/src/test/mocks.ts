import { vi } from "vitest";
import type { Env } from "../env";

/**
 * Cloudflare環境のモックを作成する
 */
export const createCloudflareEnvMock = (customMocks = {}): Env => {
	// D1データベースのモック
	const mockD1 = {
		prepare: vi.fn().mockReturnValue({
			bind: vi.fn().mockImplementation(function() { return this; }),
			first: vi.fn().mockResolvedValue({ id: "test-id", name: "Test Item" }),
			run: vi.fn().mockResolvedValue({ results: [], success: true }),
			all: vi.fn().mockResolvedValue({ results: [{ id: "item1" }, { id: "item2" }], success: true }),
			raw: vi.fn().mockResolvedValue([{ id: "item1" }, { id: "item2" }]),
		}),
		dump: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
		batch: vi.fn().mockResolvedValue([{ results: [], success: true }]),
		exec: vi.fn().mockResolvedValue({ results: [], success: true }),
		withSession: vi.fn().mockImplementation(function() { return this; }),
	};

	return {
		// D1データベース
		DB: mockD1,
		
		// DatabaseDO
		DB_DO: {
			idFromName: vi.fn().mockReturnValue("test-id"),
			idFromString: vi.fn().mockReturnValue("test-id"),
			newUniqueId: vi.fn().mockReturnValue("unique-id"),
			jurisdiction: "global",
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
		// ClassLockerDO
		CLASS_LOCKER: {
			idFromName: vi.fn().mockReturnValue("test-id"),
			idFromString: vi.fn().mockReturnValue("test-id"),
			newUniqueId: vi.fn().mockReturnValue("unique-id"),
			jurisdiction: "global",
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
	};
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

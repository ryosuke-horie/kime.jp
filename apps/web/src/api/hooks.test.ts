import { getAuthToken } from "@/utils/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateGym } from "./hooks";

// このテストファイルでMSWを無効化
process.env.DISABLE_MSW = "true";

// 依存関係をモック
vi.mock("@/utils/auth", () => ({
	getAuthToken: vi.fn(),
}));

// fetchをモック（MSWと競合を避けるため）
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useCreateGym", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// モックの初期設定
		vi.mocked(getAuthToken).mockResolvedValue("mock-token");
	});

	it("成功時はレスポンスのJSONを返す", async () => {
		const mockResponse = {
			ok: true,
			status: 201,
			json: vi.fn().mockResolvedValue({
				data: {
					id: "gym-123",
					name: "テストジム",
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				},
			}),
		};
		mockFetch.mockResolvedValue(mockResponse);

		const { createGym } = useCreateGym();
		const gymData = {
			name: "テストジム",
			ownerEmail: "test@example.com",
			password: "password123",
		};

		const result = await createGym(gymData);

		expect(result).toHaveProperty("data");
		expect((result as any).data).toHaveProperty("id", "gym-123");
		expect((result as any).data).toHaveProperty("name", "テストジム");
		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining("/api/gyms"),
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					"Content-Type": "application/json",
					Authorization: "Bearer mock-token",
				}),
				body: JSON.stringify(gymData),
			}),
		);
	});

	it("400エラー時はエラーを投げる", async () => {
		const mockErrorResponse = {
			ok: false,
			status: 400,
			statusText: "Bad Request",
			json: vi.fn().mockResolvedValue({
				error: "リクエストデータが不正です",
			}),
		};
		mockFetch.mockResolvedValue(mockErrorResponse);

		const { createGym } = useCreateGym();
		const gymData = {
			name: "テストジム",
			ownerEmail: "test@example.com",
			password: "password123",
		};

		await expect(createGym(gymData)).rejects.toThrow();
	});

	it("500エラー時はエラーを投げる", async () => {
		const mockErrorResponse = {
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
			json: vi.fn(),
		};
		mockFetch.mockResolvedValue(mockErrorResponse);

		const { createGym } = useCreateGym();
		const gymData = {
			name: "テストジム",
			ownerEmail: "test@example.com",
			password: "password123",
		};

		await expect(createGym(gymData)).rejects.toThrow();
	});

	it("ネットワークエラー時はエラーを投げる", async () => {
		mockFetch.mockRejectedValue(new Error("Network error"));

		const { createGym } = useCreateGym();
		const gymData = {
			name: "テストジム",
			ownerEmail: "test@example.com",
			password: "password123",
		};

		await expect(createGym(gymData)).rejects.toThrow("Network error");
	});

	it("認証トークンなしでも動作する", async () => {
		vi.mocked(getAuthToken).mockResolvedValue(null);
		const mockResponse = {
			ok: true,
			status: 201,
			json: vi.fn().mockResolvedValue({
				data: {
					id: "gym-123",
					name: "テストジム",
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				},
			}),
		};
		mockFetch.mockResolvedValue(mockResponse);

		const { createGym } = useCreateGym();
		const gymData = {
			name: "テストジム",
			ownerEmail: "test@example.com",
			password: "password123",
		};

		await createGym(gymData);

		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining("/api/gyms"),
			expect.objectContaining({
				headers: expect.not.objectContaining({
					Authorization: expect.anything(),
				}),
			}),
		);
	});
});

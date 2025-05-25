import { getAuthToken } from "@/utils/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateGym } from "./hooks";

// 依存関係をモック
vi.mock("@/utils/auth", () => ({
	getAuthToken: vi.fn(),
}));

// global fetchをモック
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
				message: "ジムを作成しました",
				gymId: "gym-123",
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

		expect(result).toEqual({
			message: "ジムを作成しました",
			gymId: "gym-123",
		});
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

		await expect(createGym(gymData)).rejects.toThrow("HTTP Error: 400 Bad Request");
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

		await expect(createGym(gymData)).rejects.toThrow("HTTP Error: 500 Internal Server Error");
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
				message: "ジムを作成しました",
				gymId: "gym-123",
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

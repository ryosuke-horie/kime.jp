import { getSession } from "next-auth/react";
import { vi } from "vitest";
/**
 * 認証ユーティリティのテスト
 */
import { getAuthToken } from "./auth";

// next-auth/reactをモック
vi.mock("next-auth/react", () => ({
	getSession: vi.fn(),
}));

const mockedGetSession = getSession as any;

describe("認証ユーティリティ", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getAuthToken", () => {
		test("セッションが存在しない場合はnullを返す", async () => {
			mockedGetSession.mockResolvedValue(null);

			const token = await getAuthToken();
			expect(token).toBeNull();
		});

		test("有効なセッションが存在する場合はトークンを生成する", async () => {
			const mockSession = {
				user: {
					id: "user123",
					name: "Test User",
					email: "test@example.com",
					role: "admin",
				},
			};
			mockedGetSession.mockResolvedValue(mockSession);

			const token = await getAuthToken();
			expect(token).toBeTruthy();
			expect(typeof token).toBe("string");
			expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/); // JWT形式
		});

		test("生成されたトークンが正しいJWT構造を持つ", async () => {
			const mockSession = {
				user: {
					id: "user456",
					name: "Another User",
					email: "another@example.com",
					role: "user",
				},
			};
			mockedGetSession.mockResolvedValue(mockSession);

			const token = await getAuthToken();
			expect(token).toBeTruthy();

			if (token) {
				const parts = token.split(".");
				expect(parts).toHaveLength(3); // header.payload.signature

				// ヘッダーをデコードして確認
				const header = JSON.parse(atob(parts[0] || ""));
				expect(header.alg).toBe("HS256");
				expect(header.typ).toBe("JWT");

				// ペイロードをデコードして確認
				const payload = JSON.parse(atob(parts[1] || ""));
				expect(payload.sub).toBe("user456");
				expect(payload.name).toBe("Another User");
				expect(payload.email).toBe("another@example.com");
				expect(payload.role).toBe("user");
				expect(payload.iat).toBeDefined();
				expect(payload.exp).toBeDefined();
				expect(payload.exp).toBeGreaterThan(payload.iat);
			}
		});

		test("ユーザー情報が部分的に欠けている場合も処理できる", async () => {
			const mockSession = {
				user: {
					id: "user789",
					email: "minimal@example.com",
					// name と role が未定義
				},
			};
			mockedGetSession.mockResolvedValue(mockSession);

			const token = await getAuthToken();
			expect(token).toBeTruthy();

			if (token) {
				const parts = token.split(".");
				const payload = JSON.parse(atob(parts[1] || ""));
				expect(payload.sub).toBe("user789");
				expect(payload.email).toBe("minimal@example.com");
				expect(payload.name).toBeUndefined();
				expect(payload.role).toBeUndefined();
			}
		});
	});
});

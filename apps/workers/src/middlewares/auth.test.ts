import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockAdmin, createMockAuthContext, createMockJwtToken } from "../test/auth-mocks";
import * as jwtUtils from "../utils/jwt";
import { adminOnlyMiddleware, authMiddleware } from "./auth";

describe("Authentication Middlewares", () => {
	// JWT検証のモック用スパイ
	let verifyTokenSpy: ReturnType<typeof vi.spyOn>;
	let extractAdminFromPayloadSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		// JWT検証関数のモック化
		verifyTokenSpy = vi.spyOn(jwtUtils, "verifyToken");
		extractAdminFromPayloadSpy = vi.spyOn(jwtUtils, "extractAdminFromPayload");

		// ランダムUUIDの生成をモック化して固定値を返す
		vi.spyOn(crypto, "randomUUID").mockReturnValue("test-request-id");

		// 現在時刻のモック化
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2023-01-01T00:00:00Z"));
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	describe("authMiddleware", () => {
		it("有効なトークンで認証に成功する", async () => {
			// 有効なトークンを持つリクエストのモック
			const { c, next } = createMockAuthContext({
				headers: {
					Authorization: "Bearer valid-token",
				},
			});

			// JWT検証関数のモック応答を設定
			const mockPayload = {
				sub: "admin-123",
				email: "admin@example.com",
				name: "Admin User",
				role: "admin",
				iat: 1672531200,
				exp: 1672617600,
			};

			verifyTokenSpy.mockResolvedValue({
				valid: true,
				payload: mockPayload,
			});

			const mockAdmin = createMockAdmin("admin");
			extractAdminFromPayloadSpy.mockReturnValue(mockAdmin);

			// ミドルウェアを実行
			const middleware = authMiddleware();
			await middleware(c, next);

			// 検証
			expect(verifyTokenSpy).toHaveBeenCalledWith("valid-token", "test-secret-key");
			expect(c.set).toHaveBeenCalledWith("requestId", "test-request-id");
			expect(c.set).toHaveBeenCalledWith("requestTime", new Date("2023-01-01T00:00:00Z").getTime());
			expect(c.set).toHaveBeenCalledWith("admin", mockAdmin);
			expect(next).toHaveBeenCalled();
		});

		it("Authorizationヘッダーがない場合、開発環境では処理を続行する", async () => {
			// Authorizationヘッダーのないリクエストのモック（開発環境）
			const { c, next } = createMockAuthContext({
				env: { NODE_ENV: "development" },
			});

			// ミドルウェアを実行
			const middleware = authMiddleware();
			await middleware(c, next);

			// 検証
			expect(next).toHaveBeenCalled();
			expect(c.json).not.toHaveBeenCalled();
		});

		it("Authorizationヘッダーがない場合、本番環境ではエラーを返す", async () => {
			// Authorizationヘッダーのないリクエストのモック（本番環境）
			const { c, next } = createMockAuthContext({
				env: { NODE_ENV: "production" },
			});

			// ミドルウェアを実行
			const middleware = authMiddleware();
			await middleware(c, next);

			// 検証
			expect(next).not.toHaveBeenCalled();
			expect(c.json).toHaveBeenCalledWith(
				{
					error: "認証が必要です",
					code: "missing_token",
				},
				401,
			);
		});

		it("無効なトークンでは本番環境でエラーを返す", async () => {
			// 無効なトークンを持つリクエストのモック（本番環境）
			const { c, next } = createMockAuthContext({
				headers: {
					Authorization: "Bearer invalid-token",
				},
				env: { NODE_ENV: "production" },
			});

			// JWT検証関数のモック応答を設定
			verifyTokenSpy.mockResolvedValue({
				valid: false,
				payload: null,
				error: "invalid_token",
			});

			// ミドルウェアを実行
			const middleware = authMiddleware();
			await middleware(c, next);

			// 検証
			expect(next).not.toHaveBeenCalled();
			expect(c.json).toHaveBeenCalledWith(
				{
					error: "無効な認証トークンです",
					code: "invalid_token",
				},
				401,
			);
		});

		it("期限切れトークンでは適切なエラーメッセージを返す", async () => {
			// 期限切れトークンを持つリクエストのモック
			const { c, next } = createMockAuthContext({
				headers: {
					Authorization: "Bearer expired-token",
				},
				env: { NODE_ENV: "production" },
			});

			// JWT検証関数のモック応答を設定
			verifyTokenSpy.mockResolvedValue({
				valid: false,
				payload: null,
				error: "expired_token",
			});

			// ミドルウェアを実行
			const middleware = authMiddleware();
			await middleware(c, next);

			// 検証
			expect(next).not.toHaveBeenCalled();
			expect(c.json).toHaveBeenCalledWith(
				{
					error: "認証トークンの有効期限が切れています",
					code: "expired_token",
				},
				401,
			);
		});

		it("開発環境でSKIP_AUTH=trueの場合、無効なトークンでも処理を続行する", async () => {
			// 無効なトークンを持つリクエストのモック（開発環境、認証スキップ有効）
			const { c, next } = createMockAuthContext({
				headers: {
					Authorization: "Bearer invalid-token",
				},
				env: { NODE_ENV: "development", SKIP_AUTH: "true" },
			});

			// JWT検証関数のモック応答を設定
			verifyTokenSpy.mockResolvedValue({
				valid: false,
				payload: null,
				error: "invalid_token",
			});

			// ミドルウェアを実行
			const middleware = authMiddleware();
			await middleware(c, next);

			// 検証
			expect(next).toHaveBeenCalled();
			expect(c.json).not.toHaveBeenCalled();
		});
	});

	describe("adminOnlyMiddleware", () => {
		it("管理者ロールを持つユーザーはアクセスできる", async () => {
			// 管理者権限を持つ認証済みユーザーのコンテキスト
			const adminUser = createMockAdmin("admin");

			const { c, next } = createMockAuthContext({
				adminUser,
			});

			// ミドルウェアを実行
			const middleware = adminOnlyMiddleware();
			await middleware(c, next);

			// 検証
			expect(next).toHaveBeenCalled();
			expect(c.json).not.toHaveBeenCalled();
		});

		it("スタッフロールのユーザーはアクセスできない", async () => {
			// スタッフ権限を持つ認証済みユーザーのコンテキスト
			const staffUser = createMockAdmin("staff");

			const { c, next } = createMockAuthContext({
				adminUser: staffUser,
			});

			// ミドルウェアを実行
			const middleware = adminOnlyMiddleware();
			await middleware(c, next);

			// 検証
			expect(next).not.toHaveBeenCalled();
			expect(c.json).toHaveBeenCalledWith(
				{
					error: "この操作を行う権限がありません",
					code: "insufficient_permissions",
				},
				403,
			);
		});

		it("認証済みユーザーがいない場合はエラーを返す", async () => {
			// 認証情報のないコンテキスト
			const { c, next } = createMockAuthContext({});

			// ミドルウェアを実行
			const middleware = adminOnlyMiddleware();
			await middleware(c, next);

			// 検証
			expect(next).not.toHaveBeenCalled();
			expect(c.json).toHaveBeenCalledWith(
				{
					error: "認証が必要です",
					code: "missing_authentication",
				},
				401,
			);
		});

		it("開発環境でSKIP_AUTH=trueの場合、権限チェックをスキップする", async () => {
			// 認証情報のないコンテキスト（開発環境、認証スキップ有効）
			const { c, next } = createMockAuthContext({
				env: { NODE_ENV: "development", SKIP_AUTH: "true" },
			});

			// ミドルウェアを実行
			const middleware = adminOnlyMiddleware();
			await middleware(c, next);

			// 検証
			expect(next).toHaveBeenCalled();
			expect(c.json).not.toHaveBeenCalled();
		});
	});
});

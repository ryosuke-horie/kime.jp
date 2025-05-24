import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { LoginRequest, LoginResponse, User } from "../types/auth";
import * as jwtUtils from "../utils/jwt";
import * as passwordUtils from "../utils/password";
import { AuthService } from "./auth-service";

// モック化
vi.mock("../utils/password");
vi.mock("../utils/jwt");

describe("AuthService - 単体テスト", () => {
	let authService: AuthService;
	let mockDb: any;
	let mockDrizzle: any;
	let mockPasswordCompare: Mock;
	let mockJwtGenerate: Mock;

	// テスト用のジムデータ
	const testGym = {
		gymId: "gym-1",
		name: "テストジム",
		ownerEmail: "owner@example.com",
		passwordHash: "hashed_password_123",
		phone: null,
		website: null,
		address: null,
		description: null,
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-01T00:00:00.000Z",
	};

	const testLoginRequest: LoginRequest = {
		email: "owner@example.com",
		password: "correct_password",
	};

	beforeEach(() => {
		// モック関数の設定
		mockPasswordCompare = vi.mocked(passwordUtils.comparePassword);
		mockJwtGenerate = vi.mocked(jwtUtils.generateJWT);

		// get関数のモック
		const mockGet = vi.fn();

		// where関数のモック（get()を含むオブジェクトを返す）
		const mockWhere = vi.fn().mockReturnValue({
			get: mockGet,
		});

		// from関数のモック（where()を含むオブジェクトを返す）
		const mockFrom = vi.fn().mockReturnValue({
			where: mockWhere,
		});

		// select関数のモック（from()を含むオブジェクトを返す）
		const mockSelect = vi.fn().mockReturnValue({
			from: mockFrom,
		});

		// Drizzleデータベースオブジェクトのモック
		mockDrizzle = {
			select: mockSelect,
		} as any;

		authService = new AuthService(mockDrizzle);

		// デフォルトのモック返り値を設定
		mockPasswordCompare.mockResolvedValue(true);
		mockJwtGenerate.mockResolvedValue("test_jwt_token");

		// get関数への参照を保持
		(mockDrizzle as any).mockGet = mockGet;
	});

	describe("login", () => {
		it("正しいメールとパスワードでログインが成功すること", async () => {
			// Arrange
			(mockDrizzle as any).mockGet.mockResolvedValue(testGym);

			// Act
			const result = await authService.login(testLoginRequest);

			// Debug
			console.log("Test result:", result);
			console.log("Mock calls:", {
				passwordCompare: mockPasswordCompare.mock.calls,
				jwtGenerate: mockJwtGenerate.mock.calls,
			});

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.token).toBe("test_jwt_token");
				expect(result.user).toEqual({
					id: "gym-1",
					email: "owner@example.com",
					gymId: "gym-1",
					role: "owner",
					name: "テストジム",
				});
			}

			// モック関数の呼び出しを検証
			expect(mockPasswordCompare).toHaveBeenCalledWith("correct_password", "hashed_password_123");
			expect(mockJwtGenerate).toHaveBeenCalledWith({
				userId: "gym-1",
				email: "owner@example.com",
				gymId: "gym-1",
				role: "owner",
			});
		});

		it("存在しないメールアドレスでログインが失敗すること", async () => {
			// Arrange
			(mockDrizzle as any).mockGet.mockResolvedValue(undefined);

			// Act
			const result = await authService.login({
				email: "nonexistent@example.com",
				password: "any_password",
			});

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Invalid credentials");
			}

			// パスワード検証やJWT生成が呼ばれないことを確認
			expect(mockPasswordCompare).not.toHaveBeenCalled();
			expect(mockJwtGenerate).not.toHaveBeenCalled();
		});

		it("パスワードハッシュが設定されていないジムでログインが失敗すること", async () => {
			// Arrange
			const gymWithoutPassword = { ...testGym, passwordHash: null };
			(mockDrizzle as any).mockGet.mockResolvedValue(gymWithoutPassword);

			// Act
			const result = await authService.login(testLoginRequest);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Account disabled");
			}

			// パスワード検証やJWT生成が呼ばれないことを確認
			expect(mockPasswordCompare).not.toHaveBeenCalled();
			expect(mockJwtGenerate).not.toHaveBeenCalled();
		});

		it("間違ったパスワードでログインが失敗すること", async () => {
			// Arrange
			(mockDrizzle as any).mockGet.mockResolvedValue(testGym);
			mockPasswordCompare.mockResolvedValue(false);

			// Act
			const result = await authService.login({
				email: "owner@example.com",
				password: "wrong_password",
			});

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Invalid credentials");
			}

			// パスワード検証は呼ばれるが、JWT生成は呼ばれないことを確認
			expect(mockPasswordCompare).toHaveBeenCalledWith("wrong_password", "hashed_password_123");
			expect(mockJwtGenerate).not.toHaveBeenCalled();
		});

		it("データベースエラーが発生した場合に適切にハンドリングすること", async () => {
			// Arrange
			(mockDrizzle as any).mockGet.mockRejectedValue(new Error("Database connection failed"));

			// Act & Assert
			await expect(authService.login(testLoginRequest)).rejects.toThrow(
				"Database connection failed",
			);
		});
	});

	describe("getUserFromToken", () => {
		const testJwtPayload = {
			sub: "gym-1",
			email: "owner@example.com",
			gymId: "gym-1",
			role: "owner" as const,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 3600,
		};

		it("有効なJWTペイロードからユーザー情報を取得できること", async () => {
			// Arrange
			(mockDrizzle as any).mockGet.mockResolvedValue(testGym);

			// Act
			const result = await authService.getUserFromToken(testJwtPayload);

			// Assert
			expect(result).toEqual({
				id: "gym-1",
				email: "owner@example.com",
				gymId: "gym-1",
				role: "owner",
				name: "テストジム",
			});
		});

		it("存在しないジムIDの場合にundefinedを返すこと", async () => {
			// Arrange
			(mockDrizzle as any).mockGet.mockResolvedValue(undefined);

			// Act
			const result = await authService.getUserFromToken(testJwtPayload);

			// Assert
			expect(result).toBeUndefined();
		});
	});
});

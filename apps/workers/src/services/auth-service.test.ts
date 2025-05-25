/// <reference path="../../worker-configuration.d.ts" />
/// <reference path="../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";
import { beforeEach, describe, expect, it } from "vitest";
import * as schema from "../db/schema";
import { isD1Available, itWithD1 } from "../test/helpers/test-utils";
import type { LoginRequest } from "../types/auth";
import { hashPassword } from "../utils/password";
import { AuthService } from "./auth-service";

const { gyms } = schema;

describe("AuthService - 統合テスト", () => {
	let authService: AuthService;
	let db: any;

	beforeEach(async () => {
		if (!isD1Available()) {
			return;
		}

		// 実際のテストデータベースを使用
		db = drizzle(env.DB as D1Database, { schema });
		authService = new AuthService(db);
	});

	describe("login", () => {
		itWithD1("正しいメールとパスワードでログインが成功すること", async () => {
			// テスト用のジムを作成（パスワードハッシュ付き）
			const testPassword = "testPassword123";
			const hashedPassword = await hashPassword(testPassword);

			await db.insert(gyms).values({
				gymId: "test-gym-login",
				name: "テストジム",
				ownerEmail: "test@example.com",
				passwordHash: hashedPassword,
			});

			const loginRequest: LoginRequest = {
				email: "test@example.com",
				password: testPassword,
			};

			// Act
			const result = await authService.login(loginRequest);

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.token).toBeDefined();
				expect(result.user).toEqual({
					id: "test-gym-login",
					email: "test@example.com",
					gymId: "test-gym-login",
					role: "owner",
					name: "テストジム",
				});
			}
		});

		itWithD1("存在しないメールアドレスでログインが失敗すること", async () => {
			const loginRequest: LoginRequest = {
				email: "nonexistent@example.com",
				password: "anyPassword",
			};

			const result = await authService.login(loginRequest);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Invalid credentials");
			}
		});

		itWithD1("パスワードハッシュが設定されていないジムでログインが失敗すること", async () => {
			// パスワードハッシュなしでジムを作成
			await db.insert(gyms).values({
				gymId: "test-gym-no-password",
				name: "パスワードなしジム",
				ownerEmail: "nopassword@example.com",
				passwordHash: null,
			});

			const loginRequest: LoginRequest = {
				email: "nopassword@example.com",
				password: "anyPassword",
			};

			const result = await authService.login(loginRequest);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Account disabled");
			}
		});

		itWithD1("間違ったパスワードでログインが失敗すること", async () => {
			const testPassword = "correctPassword";
			const hashedPassword = await hashPassword(testPassword);

			await db.insert(gyms).values({
				gymId: "test-gym-wrong-password",
				name: "テストジム",
				ownerEmail: "wrongpassword@example.com",
				passwordHash: hashedPassword,
			});

			const loginRequest: LoginRequest = {
				email: "wrongpassword@example.com",
				password: "wrongPassword",
			};

			const result = await authService.login(loginRequest);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Invalid credentials");
			}
		});
	});

	describe("getUserFromToken", () => {
		itWithD1("有効なJWTペイロードからユーザー情報を取得できること", async () => {
			// テスト用のジムを作成
			await db.insert(gyms).values({
				gymId: "test-gym-jwt",
				name: "JWTテストジム",
				ownerEmail: "jwt@example.com",
				passwordHash: await hashPassword("password"),
			});

			const payload = {
				sub: "test-gym-jwt",
				email: "jwt@example.com",
				gymId: "test-gym-jwt",
				role: "owner" as const,
				iat: Math.floor(Date.now() / 1000),
				exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
			};

			const user = await authService.getUserFromToken(payload);

			expect(user).toEqual({
				id: "test-gym-jwt",
				email: "jwt@example.com",
				gymId: "test-gym-jwt",
				role: "owner",
				name: "JWTテストジム",
			});
		});

		itWithD1("存在しないジムIDの場合にundefinedを返すこと", async () => {
			const payload = {
				sub: "non-existent-gym",
				email: "nonexistent@example.com",
				gymId: "non-existent-gym",
				role: "owner" as const,
				iat: Math.floor(Date.now() / 1000),
				exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
			};

			const user = await authService.getUserFromToken(payload);

			expect(user).toBeUndefined();
		});
	});
});

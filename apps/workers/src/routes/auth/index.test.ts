/// <reference path="../../../worker-configuration.d.ts" />
/// <reference path="../../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";
import { beforeEach, describe, expect } from "vitest";
import { gyms } from "../../db/schema";
import app from "../../index";
import { createTestRequest, isD1Available, itWithD1 } from "../../test/helpers/test-utils";
import type { LoginResponse, MeResponse } from "../../types/auth";
import { hashPassword } from "../../utils/password";

describe("認証API - 統合テスト", () => {
	// テスト用のジムデータ
	const testGym = {
		gymId: "test-gym-auth",
		name: "認証テスト用ジム",
		ownerEmail: "auth-test@example.com",
		phone: null,
		website: null,
		address: null,
		description: null,
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-01T00:00:00.000Z",
	};

	const testPassword = "testPassword123";

	beforeEach(async () => {
		if (!isD1Available() || !env.DB) return;

		// テスト用のジムデータを作成（パスワードハッシュ付き）
		const db = drizzle(env.DB);
		const passwordHash = await hashPassword(testPassword);

		await db.insert(gyms).values({
			...testGym,
			passwordHash,
		});
	});

	describe("POST /api/auth/login", () => {
		itWithD1("正しい認証情報でログインが成功すること", async () => {
			// Arrange
			const loginData = {
				email: testGym.ownerEmail,
				password: testPassword,
			};

			// Act
			const req = createTestRequest("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: loginData,
			});

			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// Debug
			console.log("Response status:", res.status);
			const responseBody = await res.json();
			console.log("Response body:", responseBody);

			// Assert
			expect(res.status).toBe(200);

			const data = responseBody as LoginResponse;
			expect(data.success).toBe(true);

			if (data.success) {
				expect(data.token).toBeDefined();
				expect(typeof data.token).toBe("string");
				expect(data.token.length).toBeGreaterThan(0);

				expect(data.user).toEqual({
					id: testGym.gymId,
					email: testGym.ownerEmail,
					gymId: testGym.gymId,
					role: "owner",
					name: testGym.name,
				});
			}
		});

		itWithD1("存在しないメールアドレスでログインが失敗すること", async () => {
			// Arrange
			const loginData = {
				email: "nonexistent@example.com",
				password: testPassword,
			};

			// Act
			const req = createTestRequest("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: loginData,
			});

			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// Assert
			expect(res.status).toBe(401);

			const data = (await res.json()) as LoginResponse;
			expect(data.success).toBe(false);
			if (!data.success) {
				expect(data.error).toBe("Invalid credentials");
			}
		});

		itWithD1("間違ったパスワードでログインが失敗すること", async () => {
			// Arrange
			const loginData = {
				email: testGym.ownerEmail,
				password: "wrongPassword",
			};

			// Act
			const req = createTestRequest("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: loginData,
			});

			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// Assert
			expect(res.status).toBe(401);

			const data = (await res.json()) as LoginResponse;
			expect(data.success).toBe(false);
			if (!data.success) {
				expect(data.error).toBe("Invalid credentials");
			}
		});

		itWithD1("バリデーションエラーが適切にハンドリングされること", async () => {
			// Arrange - 無効なメールアドレス
			const loginData = {
				email: "invalid-email",
				password: testPassword,
			};

			// Act
			const req = createTestRequest("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: loginData,
			});

			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// Assert
			expect(res.status).toBe(400);
		});

		itWithD1("空のリクエストボディでバリデーションエラーが発生すること", async () => {
			// Act
			const req = createTestRequest("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: {},
			});

			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// Assert
			expect(res.status).toBe(400);
		});
	});

	describe("POST /api/auth/logout", () => {
		itWithD1("ログアウトが成功すること", async () => {
			// Act
			const req = createTestRequest("/api/auth/logout", {
				method: "POST",
			});

			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// Assert
			expect(res.status).toBe(200);

			const data = await res.json();
			expect(data).toEqual({ message: "Logged out successfully" });
		});
	});

	describe("GET /api/auth/me", () => {
		let validToken: string;

		beforeEach(async () => {
			if (!isD1Available() || !env.DB) {
				test.skip("D1データベースが使用できないためテストをスキップ");
				return;
			}

			// 事前にログインしてトークンを取得
			const loginData = {
				email: testGym.ownerEmail,
				password: testPassword,
			};

			const loginReq = createTestRequest("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: loginData,
			});

			const loginRes = await app.fetch(loginReq, { DB: env.DB });
			const loginResponseData = (await loginRes.json()) as LoginResponse;

			if (loginResponseData.success) {
				validToken = loginResponseData.token;
			}
		});

		itWithD1("有効なJWTトークンでユーザー情報を取得できること", async () => {
			// Act
			const req = createTestRequest("/api/auth/me", {
				headers: {
					Authorization: `Bearer ${validToken}`,
				},
			});

			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// Assert
			expect(res.status).toBe(200);

			const data = (await res.json()) as MeResponse;
			expect(data.user).toEqual({
				id: testGym.gymId,
				email: testGym.ownerEmail,
				gymId: testGym.gymId,
				role: "owner",
				name: testGym.name,
			});
		});

		itWithD1("Authorizationヘッダーなしで401エラーが返されること", async () => {
			// Act
			const req = createTestRequest("/api/auth/me");

			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// Assert
			expect(res.status).toBe(401);
		});

		itWithD1("無効なJWTトークンで401エラーが返されること", async () => {
			// Act
			const req = createTestRequest("/api/auth/me", {
				headers: {
					Authorization: "Bearer invalid_token",
				},
			});

			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// Assert
			expect(res.status).toBe(401);
		});
	});
});

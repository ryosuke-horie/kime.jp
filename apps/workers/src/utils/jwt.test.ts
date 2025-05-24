import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JWTGenerateOptions } from "../types/auth";
import { generateJWT, verifyJWT } from "./jwt";

describe("JWT ユーティリティ関数", () => {
	const testSecret = "test-secret-key";
	const mockOptions: JWTGenerateOptions = {
		userId: "user-123",
		email: "test@example.com",
		gymId: "gym-456",
		role: "owner",
	};

	describe("generateJWT", () => {
		it("正常な入力でJWTを生成できる", async () => {
			const token = await generateJWT(mockOptions, testSecret);

			expect(token).toBeTruthy();
			expect(typeof token).toBe("string");
			expect(token.split(".")).toHaveLength(3); // JWT形式: header.payload.signature
		});

		it("デフォルトで30日の有効期限が設定される", async () => {
			const token = await generateJWT(mockOptions, testSecret);
			const result = await verifyJWT(token, testSecret);

			expect(result.success).toBe(true);
			expect(result.payload).toBeDefined();

			if (result.payload) {
				const now = Math.floor(Date.now() / 1000);
				const expectedExp = now + 30 * 24 * 60 * 60; // 30日後
				// 数秒の誤差を許容
				expect(result.payload.exp).toBeGreaterThan(now);
				expect(result.payload.exp).toBeLessThanOrEqual(expectedExp + 10);
			}
		});

		it("カスタム有効期限を設定できる", async () => {
			const customOptions = { ...mockOptions, expiresInDays: 7 };
			const token = await generateJWT(customOptions, testSecret);
			const result = await verifyJWT(token, testSecret);

			expect(result.success).toBe(true);
			expect(result.payload).toBeDefined();

			if (result.payload) {
				const now = Math.floor(Date.now() / 1000);
				const expectedExp = now + 7 * 24 * 60 * 60; // 7日後
				// 数秒の誤差を許容
				expect(result.payload.exp).toBeGreaterThan(now);
				expect(result.payload.exp).toBeLessThanOrEqual(expectedExp + 10);
			}
		});

		it("正しいペイロード構造が生成される", async () => {
			const token = await generateJWT(mockOptions, testSecret);
			const result = await verifyJWT(token, testSecret);

			expect(result.success).toBe(true);
			expect(result.payload).toMatchObject({
				sub: mockOptions.userId,
				email: mockOptions.email,
				gymId: mockOptions.gymId,
				role: mockOptions.role,
			});
			expect(typeof result.payload?.iat).toBe("number");
			expect(typeof result.payload?.exp).toBe("number");
		});
	});

	describe("verifyJWT", () => {
		it("有効なJWTを正常に検証できる", async () => {
			const token = await generateJWT(mockOptions, testSecret);
			const result = await verifyJWT(token, testSecret);

			expect(result.success).toBe(true);
			expect(result.payload).toBeDefined();
			expect(result.error).toBeUndefined();
		});

		it("無効なJWTで検証が失敗する", async () => {
			const invalidToken = "invalid.jwt.token";
			const result = await verifyJWT(invalidToken, testSecret);

			expect(result.success).toBe(false);
			expect(result.payload).toBeUndefined();
			expect(result.error).toBeDefined();
		});

		it("空文字列で検証が失敗する", async () => {
			const result = await verifyJWT("", testSecret);

			expect(result.success).toBe(false);
			expect(result.payload).toBeUndefined();
			expect(result.error).toBeDefined();
		});

		it("改ざんされたJWTで検証が失敗する", async () => {
			const token = await generateJWT(mockOptions, testSecret);
			const [header, payload] = token.split(".");
			const tamperedToken = `${header}.${payload}.tampered-signature`;

			const result = await verifyJWT(tamperedToken, testSecret);

			expect(result.success).toBe(false);
			expect(result.payload).toBeUndefined();
			expect(result.error).toBeDefined();
		});

		it("異なるシークレットで生成されたJWTで検証が失敗する", async () => {
			// 異なるシークレットでJWT生成
			const token = await generateJWT(mockOptions, "different-secret");

			// 異なるシークレットで検証
			const result = await verifyJWT(token, testSecret);

			expect(result.success).toBe(false);
			expect(result.payload).toBeUndefined();
			expect(result.error).toBeDefined();
		});
	});

	describe("JWT_SECRET環境変数の処理", () => {
		it("テスト用シークレットが正常に動作することを確認する", async () => {
			// テスト用シークレットを使用してJWTが生成・検証できることを確認
			const token = await generateJWT(mockOptions, testSecret);
			const result = await verifyJWT(token, testSecret);

			expect(result.success).toBe(true);
			expect(result.payload).toBeDefined();
		});
	});
});

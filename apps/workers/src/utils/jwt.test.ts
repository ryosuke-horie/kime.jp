import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockAdmin, createMockJwtToken } from "../test/auth-mocks";
import type { AdminAccountType } from "../types/auth";
import { extractAdminFromPayload, generateToken, verifyToken } from "./jwt";

describe("JWT Utilities", () => {
	// モックを使用する前後の処理
	beforeEach(() => {
		// 現在時刻のモック固定（2023-01-01 00:00:00）
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2023-01-01T00:00:00Z"));
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	describe("verifyToken", () => {
		const validSecret = "test-secret-key";

		it("有効なトークンを検証できること", async () => {
			// テスト用のトークンを作成（ペイロードと構造が有効）
			const validToken = createMockJwtToken({
				adminId: "test-admin-id",
				email: "admin@example.com",
				name: "Test Admin",
				role: "admin",
				iat: Math.floor(new Date("2023-01-01T00:00:00Z").getTime() / 1000),
				exp: Math.floor(new Date("2023-02-01T00:00:00Z").getTime() / 1000), // 1ヶ月後
			});

			const result = await verifyToken(validToken, validSecret);

			expect(result.valid).toBe(true);
			expect(result.payload).toHaveProperty("sub", "test-admin-id");
			expect(result.payload).toHaveProperty("email", "admin@example.com");
			expect(result.payload).toHaveProperty("name", "Test Admin");
			expect(result.payload).toHaveProperty("role", "admin");
			expect(result.error).toBeUndefined();
		});

		it("トークンがない場合はmissing_tokenエラーを返す", async () => {
			const result = await verifyToken("", validSecret);

			expect(result.valid).toBe(false);
			expect(result.payload).toBeNull();
			expect(result.error).toBe("missing_token");
		});

		it("無効な形式のトークンではinvalid_tokenエラーを返す", async () => {
			const invalidToken = "not.a.valid.jwt.token";

			const result = await verifyToken(invalidToken, validSecret);

			expect(result.valid).toBe(false);
			expect(result.payload).toBeNull();
			expect(result.error).toBe("invalid_token");
		});

		it("期限切れトークンではexpired_tokenエラーを返す", async () => {
			// 期限切れのペイロードを持つトークン
			const expiredToken = createMockJwtToken({
				exp: Math.floor(new Date("2022-12-31T23:59:59Z").getTime() / 1000), // 1秒前に期限切れ
			});

			const result = await verifyToken(expiredToken, validSecret);

			expect(result.valid).toBe(false);
			expect(result.payload).toBeNull();
			expect(result.error).toBe("expired_token");
		});

		it("デコード不可能なペイロードではinvalid_tokenエラーを返す", async () => {
			// Base64デコードはできるが不正なJSONを持つトークン
			const invalidPayloadToken =
				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
				"invalid-base64-payload" + // デコード不可能なペイロード
				".dummy_signature";

			const result = await verifyToken(invalidPayloadToken, validSecret);

			expect(result.valid).toBe(false);
			expect(result.payload).toBeNull();
			expect(result.error).toBe("invalid_token");
		});
	});

	describe("extractAdminFromPayload", () => {
		it("ペイロードから正しい管理者情報を抽出する", () => {
			const payload = {
				sub: "admin-123",
				email: "admin@example.com",
				name: "Admin User",
				role: "admin",
				iat: 1672531200,
				exp: 1672617600,
			};

			const admin = extractAdminFromPayload(payload);

			expect(admin).toEqual({
				adminId: "admin-123",
				email: "admin@example.com",
				name: "Admin User",
				role: "admin",
				isActive: true,
			});
		});

		it("スタッフロールも正しく抽出する", () => {
			const payload = {
				sub: "staff-456",
				email: "staff@example.com",
				name: "Staff User",
				role: "staff",
				iat: 1672531200,
				exp: 1672617600,
			};

			const admin = extractAdminFromPayload(payload);

			expect(admin).toEqual({
				adminId: "staff-456",
				email: "staff@example.com",
				name: "Staff User",
				role: "staff",
				isActive: true,
			});
		});
	});

	describe("generateToken", () => {
		const testSecret = "test-secret-key";

		it("管理者情報から有効なJWTトークンを生成する", async () => {
			const admin = createMockAdmin("admin");

			const token = await generateToken(admin, testSecret);

			// トークンフォーマットの検証（header.payload.signature）
			expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);

			// 生成したトークンを検証して、正しいペイロードが含まれていることを確認
			const { valid, payload } = await verifyToken(token, testSecret);
			expect(valid).toBe(true);
			expect(payload).toHaveProperty("sub", admin.adminId);
			expect(payload).toHaveProperty("email", admin.email);
			expect(payload).toHaveProperty("name", admin.name);
			expect(payload).toHaveProperty("role", admin.role);
			expect(payload).toHaveProperty("iat");
			expect(payload).toHaveProperty("exp");
		});

		it("カスタム有効期限でトークンを生成できる", async () => {
			const admin = createMockAdmin("staff");

			// 1時間の有効期限
			const expiresIn = 60 * 60;
			const token = await generateToken(admin, testSecret, expiresIn);

			// 現在時刻（テスト内でモックした時刻）
			const now = Math.floor(new Date("2023-01-01T00:00:00Z").getTime() / 1000);

			// 生成したトークンを検証
			const { valid, payload } = await verifyToken(token, testSecret);
			expect(valid).toBe(true);
			expect(payload).toHaveProperty("iat", now);
			expect(payload).toHaveProperty("exp", now + expiresIn);
		});
	});
});

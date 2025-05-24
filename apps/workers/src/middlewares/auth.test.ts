import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { generateJWT } from "../utils/jwt";
import { jwtAuth, requireGymAccess } from "./auth";

describe("認証ミドルウェア", () => {
	let app: Hono;
	const testSecret = "test-secret-for-auth-middleware-testing";

	beforeEach(() => {
		// テスト用の環境変数設定
		process.env.JWT_SECRET = testSecret;
		app = new Hono();
	});

	describe("jwtAuth ミドルウェア", () => {
		it("有効なJWTで認証が成功する", async () => {
			// テスト用JWT生成
			const token = await generateJWT(
				{
					userId: "user-123",
					email: "test@example.com",
					gymId: "gym-456",
					role: "owner",
				},
				testSecret,
			);

			app.use("/protected", jwtAuth());
			app.get("/protected", (c) => {
				const auth = c.get("auth");
				return c.json({ success: true, userId: auth.userId });
			});

			const response = await app.request("/protected", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			// デバッグ：レスポンス内容を確認
			if (response.status !== 200) {
				const errorData = await response.json();
				console.log("Error response:", errorData);
			}

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data).toEqual({
				success: true,
				userId: "user-123",
			});
		});

		it("Authorizationヘッダーがない場合401エラーになる", async () => {
			app.use("/protected", jwtAuth());
			app.get("/protected", (c) => c.json({ success: true }));

			const response = await app.request("/protected");

			expect(response.status).toBe(401);
			const data = await response.json() as { error: string };
			expect(data.error).toBe("Missing authorization header");
		});

		it("無効なBearer形式で401エラーになる", async () => {
			app.use("/protected", jwtAuth());
			app.get("/protected", (c) => c.json({ success: true }));

			const response = await app.request("/protected", {
				headers: {
					Authorization: "Invalid format",
				},
			});

			expect(response.status).toBe(401);
			const data = await response.json() as { error: string };
			expect(data.error).toBe("Invalid authorization header format");
		});

		it("無効なJWTで401エラーになる", async () => {
			app.use("/protected", jwtAuth());
			app.get("/protected", (c) => c.json({ success: true }));

			const response = await app.request("/protected", {
				headers: {
					Authorization: "Bearer invalid.jwt.token",
				},
			});

			expect(response.status).toBe(401);
			const data = await response.json() as { error: string };
			expect(data.error).toBeDefined();
		});

		it("認証成功時にコンテキストにauth情報が設定される", async () => {
			const token = await generateJWT(
				{
					userId: "user-789",
					email: "test2@example.com",
					gymId: "gym-012",
					role: "staff",
				},
				testSecret,
			);

			app.use("/protected", jwtAuth());
			app.get("/protected", (c) => {
				const auth = c.get("auth");
				return c.json({
					userId: auth.userId,
					gymId: auth.gymId,
					role: auth.role,
					email: auth.email,
				});
			});

			const response = await app.request("/protected", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data).toEqual({
				userId: "user-789",
				gymId: "gym-012",
				role: "staff",
				email: "test2@example.com",
			});
		});
	});

	describe("requireGymAccess ミドルウェア", () => {
		it("一致するgymIdでアクセスが許可される", async () => {
			const token = await generateJWT(
				{
					userId: "user-123",
					email: "test@example.com",
					gymId: "gym-456",
					role: "owner",
				},
				testSecret,
			);

			app.use("/gym/:gymId/*", jwtAuth());
			app.use("/gym/:gymId/*", requireGymAccess());
			app.get("/gym/:gymId/dashboard", (c) => c.json({ success: true }));

			const response = await app.request("/gym/gym-456/dashboard", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			expect(response.status).toBe(200);
			const data = await response.json() as { success: boolean };
			expect(data.success).toBe(true);
		});

		it("異なるgymIdで403エラーになる", async () => {
			const token = await generateJWT(
				{
					userId: "user-123",
					email: "test@example.com",
					gymId: "gym-456",
					role: "owner",
				},
				testSecret,
			);

			app.use("/gym/:gymId/*", jwtAuth());
			app.use("/gym/:gymId/*", requireGymAccess());
			app.get("/gym/:gymId/dashboard", (c) => c.json({ success: true }));

			const response = await app.request("/gym/gym-789/dashboard", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			expect(response.status).toBe(403);
			const data = await response.json() as { error: string };
			expect(data.error).toBe("Access denied: gym ID mismatch");
		});

		it("gymIdパラメータがない場合400エラーになる", async () => {
			const token = await generateJWT(
				{
					userId: "user-123",
					email: "test@example.com",
					gymId: "gym-456",
					role: "owner",
				},
				testSecret,
			);

			app.use("/dashboard", jwtAuth());
			app.use("/dashboard", requireGymAccess());
			app.get("/dashboard", (c) => c.json({ success: true }));

			const response = await app.request("/dashboard", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			expect(response.status).toBe(400);
			const data = await response.json() as { error: string };
			expect(data.error).toBe("Missing gymId parameter");
		});

		it("認証情報がない場合にエラーになる", async () => {
			app.use("/gym/:gymId/*", requireGymAccess());
			app.get("/gym/:gymId/dashboard", (c) => c.json({ success: true }));

			const response = await app.request("/gym/gym-456/dashboard");

			expect(response.status).toBe(401);
			const data = await response.json() as { error: string };
			expect(data.error).toBe("Authentication required");
		});
	});

	describe("ミドルウェアの組み合わせ", () => {
		it("jwtAuth + requireGymAccess が正常に動作する", async () => {
			const token = await generateJWT(
				{
					userId: "user-123",
					email: "test@example.com",
					gymId: "gym-456",
					role: "owner",
				},
				testSecret,
			);

			app.use("/gym/:gymId/*", jwtAuth());
			app.use("/gym/:gymId/*", requireGymAccess());
			app.get("/gym/:gymId/staff", (c) => {
				const auth = c.get("auth");
				return c.json({
					success: true,
					gymId: auth.gymId,
					role: auth.role,
				});
			});

			const response = await app.request("/gym/gym-456/staff", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data).toEqual({
				success: true,
				gymId: "gym-456",
				role: "owner",
			});
		});
	});
});

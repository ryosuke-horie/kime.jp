/// <reference path="../../../worker-configuration.d.ts" />
import { Hono } from "hono";
import { AuthController } from "../../controllers/auth-controller";
import { jwtAuth } from "../../middlewares/auth";

// Honoアプリケーションの型定義
type AppHono = Hono<{ Bindings: CloudflareBindings }>;

/**
 * 認証関連のAPIルーター
 */
export const authRouter: AppHono = new Hono();

// ログインエンドポイント（認証不要）
authRouter.post("/login", (c) => {
	const controller = new AuthController(c.env.DB);
	return controller.login(c);
});

// ログアウトエンドポイント（認証不要、シンプルなレスポンス）
authRouter.post("/logout", (c) => {
	const controller = new AuthController(c.env.DB);
	return controller.logout(c);
});

// 認証状態確認エンドポイント（認証必要）
authRouter.get("/me", jwtAuth(process.env.NODE_ENV === "test" ? "test-secret" : undefined), (c) => {
	const controller = new AuthController(c.env.DB);
	return controller.me(c);
});

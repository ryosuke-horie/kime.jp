import { drizzle } from "drizzle-orm/d1";
/// <reference path="../../worker-configuration.d.ts" />
import type { Context } from "hono";
import { AuthService } from "../services/auth-service";
import type { AuthenticatedContext } from "../types/auth";
import { loginRequestSchema } from "../types/validation";
import { BadRequestError, ServerError, UnauthorizedError } from "../utils/errors";

// Honoのコンテキスト型拡張
type AppContext = Context<{ Bindings: CloudflareBindings }>;

export class AuthController {
	private authService: AuthService;

	constructor(db: D1Database) {
		const drizzleDb = drizzle(db);
		this.authService = new AuthService(drizzleDb);
	}

	/**
	 * POST /api/auth/login - ログイン
	 */
	async login(c: AppContext) {
		try {
			// リクエストボディの取得とバリデーション
			const body = await c.req.json();
			const result = loginRequestSchema.safeParse(body);

			if (!result.success) {
				return c.json(
					{
						error: "バリデーションエラー",
						details: result.error.format(),
					},
					{ status: 400 },
				);
			}

			// 認証サービスでログイン処理
			const loginResult = await this.authService.login(result.data);

			if (!loginResult.success) {
				return c.json(loginResult, { status: 401 });
			}

			return c.json(loginResult, { status: 200 });
		} catch (error) {
			console.error("Login error:", error);
			return c.json(
				{
					error: "ログイン処理中にエラーが発生しました",
				},
				{ status: 500 },
			);
		}
	}

	/**
	 * POST /api/auth/logout - ログアウト
	 */
	async logout(c: AppContext) {
		try {
			// JWT認証の場合、サーバーサイドでの状態管理は不要
			// クライアントサイドでトークンを削除することでログアウト
			return c.json(
				{
					message: "Logged out successfully",
				},
				{ status: 200 },
			);
		} catch (error) {
			console.error("Logout error:", error);
			return c.json(
				{
					error: "ログアウト処理中にエラーが発生しました",
				},
				{ status: 500 },
			);
		}
	}

	/**
	 * GET /api/auth/me - 認証状態確認
	 */
	async me(c: AppContext) {
		try {
			// jwtAuth()ミドルウェアによって認証済みのコンテキストから情報を取得
			const authContext = c.get("auth") as AuthenticatedContext;

			if (!authContext) {
				return c.json(
					{
						error: "認証情報が見つかりません",
					},
					{ status: 401 },
				);
			}

			// JWTペイロードからユーザー情報を取得
			const user = await this.authService.getUserFromToken(authContext.payload);

			if (!user) {
				return c.json(
					{
						error: "ユーザー情報が見つかりません",
					},
					{ status: 404 },
				);
			}

			return c.json(
				{
					user,
				},
				{ status: 200 },
			);
		} catch (error) {
			console.error("Me endpoint error:", error);
			return c.json(
				{
					error: "ユーザー情報取得中にエラーが発生しました",
				},
				{ status: 500 },
			);
		}
	}
}

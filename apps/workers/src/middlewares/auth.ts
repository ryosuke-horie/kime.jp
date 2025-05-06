import type { Context, MiddlewareHandler, Next } from "hono";
import type { Env } from "../env";
import type { AdminAccountType } from "../types";
import { extractAdminFromPayload, verifyToken } from "../utils/jwt";

/**
 * 拡張コンテキスト型の定義
 * リクエスト情報や認証ユーザー情報を保持
 */
export interface AppContext {
	requestId: string;
	requestTime: number;
	admin?: AdminAccountType; // 認証済み管理者情報
}

/**
 * APIリクエストに対する基本的な認証チェックを行うミドルウェア
 * Authorization: Bearer <token> 形式のヘッダーからJWTトークンを抽出し検証する
 */
export const authMiddleware = (): MiddlewareHandler<{
	Bindings: Env;
	Variables: AppContext;
}> => {
	return async (c: Context<{ Bindings: Env; Variables: AppContext }>, next: Next) => {
		// リクエスト情報をコンテキストに追加
		c.set("requestId", crypto.randomUUID());
		c.set("requestTime", Date.now());

		// ログ出力
		console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url}`);

		// 認証ヘッダーからトークンを抽出
		const authHeader = c.req.header("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			// 開発環境では認証をスキップ
			if (c.env.NODE_ENV !== "production") {
				console.warn("[AUTH] Development mode: Authentication skipped");
				await next();
				return;
			}

			// 本番環境では認証エラーを返す
			return c.json(
				{
					error: "認証が必要です",
					code: "missing_token",
				},
				401,
			);
		}

		const token = authHeader.substring(7); // "Bearer "の後ろの部分を取得
		const jwtSecret = c.env.JWT_SECRET || "your-development-secret-key";

		// トークンを検証
		const { valid, payload, error } = await verifyToken(token, jwtSecret);

		if (!valid || !payload) {
			// 開発環境では認証エラーをスキップ可能に
			if (c.env.NODE_ENV !== "production" && c.env.SKIP_AUTH === "true") {
				console.warn(`[AUTH] Development mode: Token verification failed (${error}), but skipped`);
				await next();
				return;
			}

			// エラーメッセージを生成
			let errorMessage = "認証に失敗しました";
			const statusCode = 401;

			if (error === "expired_token") {
				errorMessage = "認証トークンの有効期限が切れています";
			} else if (error === "invalid_token") {
				errorMessage = "無効な認証トークンです";
			}

			return c.json(
				{
					error: errorMessage,
					code: error,
				},
				statusCode,
			);
		}

		// 認証成功：管理者情報をコンテキストに設定
		const admin = extractAdminFromPayload(payload);
		c.set("admin", admin);

		await next();
	};
};

/**
 * 管理者（スタッフ）のみアクセス可能なエンドポイント用のミドルウェア
 * authMiddlewareの後に使用することを前提
 */
export const adminOnlyMiddleware = (): MiddlewareHandler<{
	Bindings: Env;
	Variables: AppContext;
}> => {
	return async (c: Context<{ Bindings: Env; Variables: AppContext }>, next: Next) => {
		// 開発環境では認証をスキップ可能に
		if (c.env.NODE_ENV !== "production" && c.env.SKIP_AUTH === "true") {
			console.warn("[AUTH] Development mode: Admin role check skipped");
			await next();
			return;
		}

		// 認証済みユーザー情報を取得
		const admin = c.get("admin");

		// 認証済みユーザーが存在しない場合（authMiddlewareが先に実行されていることが前提）
		if (!admin) {
			return c.json(
				{
					error: "認証が必要です",
					code: "missing_authentication",
				},
				401,
			);
		}

		// 管理者権限を確認
		if (admin.role !== "admin") {
			return c.json(
				{
					error: "この操作を行う権限がありません",
					code: "insufficient_permissions",
				},
				403,
			);
		}

		await next();
	};
};

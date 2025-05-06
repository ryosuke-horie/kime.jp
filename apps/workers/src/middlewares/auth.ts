import type { Context, MiddlewareHandler, Next } from "hono";
import type { Env } from "../env";

/**
 * APIリクエストに対する基本的な認証チェックを行うミドルウェア
 * ※ MVPフェーズでは簡易的な実装。将来的にはJWT検証などを追加予定
 */
// 拡張コンテキスト型の定義
interface AppContext {
	requestId: string;
	requestTime: number;
}

export const authMiddleware = (): MiddlewareHandler<{
	Bindings: Env;
	Variables: AppContext;
}> => {
	return async (c: Context<{ Bindings: Env; Variables: AppContext }>, next: Next) => {
		// MVPフェーズでは認証をスキップ（開発用）
		// TODO: 本番環境では適切な認証を実装する

		// リクエスト情報をコンテキストに追加
		c.set("requestId", crypto.randomUUID());
		c.set("requestTime", Date.now());

		// ログ出力（将来的にはAnalytics Engineに送信）
		console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url}`);

		await next();
	};
};

/**
 * 管理者（スタッフ）のみアクセス可能なエンドポイント用のミドルウェア
 */
export const adminOnlyMiddleware = (): MiddlewareHandler<{
	Bindings: Env;
	Variables: AppContext;
}> => {
	return async (_c: Context<{ Bindings: Env; Variables: AppContext }>, next: Next) => {
		// MVPフェーズでは認証をスキップ（開発用）
		// TODO: 本番環境では適切な認証と権限チェックを実装する

		await next();
	};
};

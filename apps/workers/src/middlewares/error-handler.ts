import type { Context, MiddlewareHandler, Next } from "hono";
import { AppError, formatError } from "../utils/errors";

/**
 * エラーハンドリングミドルウェア
 * アプリケーション全体で発生するエラーを捕捉し、統一されたフォーマットでレスポンスを返す
 */
export const errorHandler: MiddlewareHandler = async (c: Context, next: Next) => {
	try {
		// 次のミドルウェアまたはルートハンドラを実行
		await next();
	} catch (error) {
		// エラーのフォーマット処理
		const formattedError = formatError(error);

		// 500系エラーはログに出力（本番環境では適切なログサービスに記録すべき）
		if (formattedError.status >= 500) {
			console.error("[Server Error]", error);
		}

		// エラーレスポンスを返す
		return c.json(
			{
				error: formattedError.error,
				...(formattedError.details && { details: formattedError.details }),
			},
			{ status: formattedError.status },
		);
	}
};

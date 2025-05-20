import type { Context, MiddlewareHandler, Next } from "hono";
import { AppError, formatError } from "../utils/errors";

// Honoで使用可能なHTTPステータスコード
type HTTPStatusCode = 400 | 401 | 403 | 404 | 409 | 500;

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
			{ status: formattedError.status as HTTPStatusCode },
		);
	}

	// 正常系の場合は明示的に返り値なし（次のミドルウェアに処理を委ねる）
	return undefined;
};

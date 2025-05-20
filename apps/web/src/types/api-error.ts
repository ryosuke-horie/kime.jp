/**
 * APIエラーの拡張インターフェース
 */
export interface ApiError extends Error {
	status?: number;
	data?: unknown;
	response?: Response;
}

/**
 * 通常のErrorをApiError型に変換する
 */
export function asApiError(error: Error): ApiError {
	return error as ApiError;
}

/**
 * APIエラーかどうかをチェックする型ガード
 */
export function isApiError(error: unknown): error is ApiError {
	return error instanceof Error && "status" in error;
}

/**
 * アプリケーションのエラーを表す基底クラス
 */
export class AppError extends Error {
	public status: number;
	public details?: Record<string, unknown>;

	constructor(message: string, status = 500, details?: Record<string, unknown>) {
		super(message);
		this.name = this.constructor.name;
		this.status = status;
		this.details = details;

		// Errorクラスとの互換性のために必要（TypeScriptでのクラス継承問題対応）
		Object.setPrototypeOf(this, AppError.prototype);
	}
}

/**
 * 400 Bad Request - クライアントからのリクエストが不正な場合
 */
export class BadRequestError extends AppError {
	constructor(message = "不正なリクエストです", details?: Record<string, unknown>) {
		super(message, 400, details);
		Object.setPrototypeOf(this, BadRequestError.prototype);
	}
}

/**
 * 401 Unauthorized - 認証が必要な場合
 */
export class UnauthorizedError extends AppError {
	constructor(message = "認証が必要です", details?: Record<string, unknown>) {
		super(message, 401, details);
		Object.setPrototypeOf(this, UnauthorizedError.prototype);
	}
}

/**
 * 403 Forbidden - 権限が不足している場合
 */
export class ForbiddenError extends AppError {
	constructor(message = "アクセス権限がありません", details?: Record<string, unknown>) {
		super(message, 403, details);
		Object.setPrototypeOf(this, ForbiddenError.prototype);
	}
}

/**
 * 404 Not Found - リソースが見つからない場合
 */
export class NotFoundError extends AppError {
	constructor(message = "リソースが見つかりません", details?: Record<string, unknown>) {
		super(message, 404, details);
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}
}

/**
 * 409 Conflict - リソースの競合がある場合
 */
export class ConflictError extends AppError {
	constructor(message = "リソースが競合しています", details?: Record<string, unknown>) {
		super(message, 409, details);
		Object.setPrototypeOf(this, ConflictError.prototype);
	}
}

/**
 * 500 Internal Server Error - サーバー内部エラーの場合
 */
export class ServerError extends AppError {
	constructor(message = "サーバーエラーが発生しました", details?: Record<string, unknown>) {
		super(message, 500, details);
		Object.setPrototypeOf(this, ServerError.prototype);
	}
}

/**
 * エラーをレスポンス用の形式にフォーマットする
 */
export function formatError(error: unknown): {
	error: string;
	details?: Record<string, unknown>;
	status: number;
} {
	// AppErrorの場合
	if (error instanceof AppError) {
		return {
			error: error.message,
			...(error.details && { details: error.details }),
			status: error.status,
		};
	}

	// 一般的なErrorの場合
	if (error instanceof Error) {
		return {
			error: error.message,
			status: 500,
		};
	}

	// 文字列の場合
	if (typeof error === "string") {
		return {
			error,
			status: 500,
		};
	}

	// その他の場合
	return {
		error: "不明なエラーが発生しました",
		status: 500,
	};
}

/**
 * JWT認証関連の型定義
 */

/**
 * JWTペイロード構造
 */
export interface JWTPayload {
	/** ユーザーID */
	sub: string;
	/** メールアドレス */
	email: string;
	/** ジムID（重要：リソースアクセス制御に使用） */
	gymId: string;
	/** ロール */
	role: "owner" | "staff";
	/** 発行時刻（Unix timestamp） */
	iat: number;
	/** 有効期限（Unix timestamp） */
	exp: number;
}

/**
 * JWT生成オプション
 */
export interface JWTGenerateOptions {
	/** ユーザーID */
	userId: string;
	/** メールアドレス */
	email: string;
	/** ジムID */
	gymId: string;
	/** ロール */
	role: "owner" | "staff";
	/** 有効期限（デフォルト: 30日） */
	expiresInDays?: number;
}

/**
 * JWT検証結果
 */
export interface JWTVerifyResult {
	/** 検証成功フラグ */
	success: boolean;
	/** ペイロード（成功時のみ） */
	payload?: JWTPayload;
	/** エラーメッセージ（失敗時のみ） */
	error?: string;
}

/**
 * 認証されたリクエストのコンテキスト
 */
export interface AuthenticatedContext {
	/** JWTペイロード */
	payload: JWTPayload;
	/** ユーザーID */
	userId: string;
	/** ジムID */
	gymId: string;
	/** ロール */
	role: "owner" | "staff";
	/** メールアドレス */
	email: string;
}

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

/**
 * ログインリクエスト
 */
export interface LoginRequest {
	/** メールアドレス */
	email: string;
	/** パスワード */
	password: string;
}

/**
 * ユーザー情報
 */
export interface User {
	/** ユーザーID */
	id: string;
	/** メールアドレス */
	email: string;
	/** ジムID */
	gymId: string;
	/** ロール */
	role: "owner" | "staff";
	/** 名前 */
	name: string;
}

/**
 * ログイン成功レスポンス
 */
export interface LoginSuccessResponse {
	/** 成功フラグ */
	success: true;
	/** JWTトークン */
	token: string;
	/** ユーザー情報 */
	user: User;
}

/**
 * ログイン失敗レスポンス
 */
export interface LoginErrorResponse {
	/** 成功フラグ */
	success: false;
	/** エラーメッセージ */
	error: "Invalid credentials" | "Account disabled";
}

/**
 * ログインレスポンス
 */
export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

/**
 * /api/auth/me レスポンス
 */
export interface MeResponse {
	/** ユーザー情報 */
	user: User;
}

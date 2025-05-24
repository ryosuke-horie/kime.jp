import { API_BASE_URL } from "../types";

/**
 * ジム認証ログインリクエスト
 */
export interface GymLoginRequest {
	email: string;
	password: string;
}

/**
 * ジムユーザー情報
 */
export interface GymUser {
	id: string;
	email: string;
	gymId: string;
	role: "owner" | "staff";
	name: string;
}

/**
 * ログイン成功レスポンス
 */
export interface GymLoginSuccessResponse {
	success: true;
	token: string;
	user: GymUser;
}

/**
 * ログイン失敗レスポンス
 */
export interface GymLoginErrorResponse {
	success: false;
	error: "Invalid credentials" | "Account disabled" | string;
}

/**
 * ログインレスポンス
 */
export type GymLoginResponse = GymLoginSuccessResponse | GymLoginErrorResponse;

/**
 * /api/auth/me レスポンス
 */
export interface GymMeResponse {
	user: GymUser;
}

/**
 * ログアウトレスポンス
 */
export interface GymLogoutResponse {
	message: string;
}

/**
 * APIエラーレスポンス
 */
export interface GymApiErrorResponse {
	error: string;
	details?: unknown;
}

/**
 * ジム認証用APIクライアント
 */
export class GymAuthClient {
	private baseUrl: string;

	constructor(env: keyof typeof API_BASE_URL = "development") {
		this.baseUrl = API_BASE_URL[env];
	}

	/**
	 * ログイン
	 */
	async login(credentials: GymLoginRequest): Promise<GymLoginResponse> {
		const response = await fetch(`${this.baseUrl}/api/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(credentials),
		});

		const data = await response.json();

		if (!response.ok) {
			// エラーレスポンスの場合
			const errorData = data as GymApiErrorResponse;
			return {
				success: false,
				error: errorData.error || "ログインに失敗しました",
			};
		}

		return data as GymLoginResponse;
	}

	/**
	 * ログアウト
	 */
	async logout(token: string): Promise<GymLogoutResponse> {
		const response = await fetch(`${this.baseUrl}/api/auth/logout`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const errorData = (await response.json()) as GymApiErrorResponse;
			throw new Error(errorData.error || "ログアウトに失敗しました");
		}

		return response.json() as Promise<GymLogoutResponse>;
	}

	/**
	 * 認証状態確認・ユーザー情報取得
	 */
	async getMe(token: string): Promise<GymMeResponse> {
		const response = await fetch(`${this.baseUrl}/api/auth/me`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const errorData = (await response.json()) as GymApiErrorResponse;
			throw new Error(errorData.error || "ユーザー情報の取得に失敗しました");
		}

		return response.json() as Promise<GymMeResponse>;
	}
}

/**
 * デフォルトのジム認証クライアントインスタンス
 */
export const gymAuthClient = new GymAuthClient();

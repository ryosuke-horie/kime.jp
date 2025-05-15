import {
	API_BASE_URL,
	type CreateGymRequestType,
	type CreateGymResponseType,
	type ErrorResponseType,
	type GymDetailResponseType,
	type GymListResponseType,
	type HealthCheckResponseType,
	type SuccessResponseType,
	type UpdateGymRequestType,
} from "../types";
import type { AdminInfo } from "../types/admin";
import { getAuthToken } from "../utils/auth";

/**
 * API接続用クライアントクラス
 */
export class ApiClient {
	private baseUrl: string;
	private apiKey?: string;
	private headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	private useSession: boolean;

	/**
	 * APIクライアントを初期化
	 * @param env 環境設定（production/staging/development）
	 * @param apiKey APIキー（管理者用APIなど）
	 * @param useSession NextAuthセッショントークンを使用するかどうか
	 */
	constructor(env: keyof typeof API_BASE_URL = "development", apiKey?: string, useSession = true) {
		this.baseUrl = API_BASE_URL[env];
		this.useSession = useSession;

		if (apiKey) {
			this.apiKey = apiKey;
			this.headers["X-API-Key"] = apiKey;
		}
	}

	/**
	 * APIを呼び出す汎用メソッド
	 */
	private async fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${path}`;
		let headersWithAuth = { ...this.headers };

		// APIキーまたはセッショントークンによる認証
		if (this.apiKey) {
			// APIキーを優先
			headersWithAuth = { ...headersWithAuth, Authorization: `Bearer ${this.apiKey}` };
		} else if (this.useSession) {
			// NextAuthセッショントークンを取得
			const token = await getAuthToken();
			if (token) {
				headersWithAuth = { ...headersWithAuth, Authorization: `Bearer ${token}` };
			}
		}

		const response = await fetch(url, {
			...options,
			headers: {
				...headersWithAuth,
				...options.headers,
			},
		});

		const data = await response.json();

		if (!response.ok) {
			// エラーレスポンスを型付きで扱う
			const errorData = data as ErrorResponseType;
			throw new Error(errorData.error || "APIエラーが発生しました");
		}

		return data as T;
	}

	// ヘルスチェック
	async getHealth(): Promise<HealthCheckResponseType> {
		return this.fetchApi<HealthCheckResponseType>("/health");
	}

	// ジム一覧取得（管理者用）
	async getGyms(page = 1, limit = 20): Promise<GymListResponseType> {
		return this.fetchApi<GymListResponseType>(`/api/gyms?page=${page}&limit=${limit}`);
	}

	// ジム詳細取得
	async getGym(gymId: string): Promise<GymDetailResponseType> {
		return this.fetchApi<GymDetailResponseType>(`/api/gyms/${gymId}`);
	}

	// ジム作成（管理者用）
	async createGym(data: CreateGymRequestType): Promise<CreateGymResponseType> {
		return this.fetchApi<CreateGymResponseType>("/api/gyms", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	// ジム更新（管理者用）
	async updateGym(gymId: string, data: UpdateGymRequestType): Promise<SuccessResponseType> {
		return this.fetchApi<SuccessResponseType>(`/api/gyms/${gymId}`, {
			method: "PATCH",
			body: JSON.stringify(data),
		});
	}

	// ジム削除（管理者用）
	async deleteGym(gymId: string): Promise<SuccessResponseType> {
		return this.fetchApi<SuccessResponseType>(`/api/gyms/${gymId}`, {
			method: "DELETE",
		});
	}

	// 管理者情報取得（認証済みユーザー）
	async getMe(): Promise<AdminInfo> {
		return this.fetchApi<AdminInfo>("/api/auth/me");
	}
}

import {
	API_BASE_URL,
	CreateGymRequestType,
	CreateGymResponseType,
	ErrorResponseType,
	GymDetailResponseType,
	GymListResponseType,
	HealthCheckResponseType,
	SuccessResponseType,
	UpdateGymRequestType,
} from "@kime/api-types";

/**
 * API接続用クライアントクラス
 */
export class ApiClient {
	private baseUrl: string;
	private apiKey?: string;
	private headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	/**
	 * APIクライアントを初期化
	 * @param env 環境設定（production/staging/development）
	 * @param apiKey APIキー（管理者用APIなど）
	 */
	constructor(
		env: keyof typeof API_BASE_URL = "development",
		apiKey?: string,
	) {
		this.baseUrl = API_BASE_URL[env];
		
		if (apiKey) {
			this.apiKey = apiKey;
			this.headers["X-API-Key"] = apiKey;
		}
	}

	/**
	 * APIを呼び出す汎用メソッド
	 */
	private async fetchApi<T>(
		path: string,
		options: RequestInit = {},
	): Promise<T> {
		const url = `${this.baseUrl}${path}`;
		// APIキーがあれば認証ヘッダーを追加（ここで使用することでTS6133エラーを回避）
		const headersWithAuth = this.apiKey 
			? { ...this.headers, "Authorization": `Bearer ${this.apiKey}` }
			: this.headers;
			
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
	async getGyms(
		page = 1,
		limit = 20,
	): Promise<GymListResponseType> {
		return this.fetchApi<GymListResponseType>(
			`/api/gyms/admin?page=${page}&limit=${limit}`,
		);
	}

	// ジム詳細取得
	async getGym(gymId: string): Promise<GymDetailResponseType> {
		return this.fetchApi<GymDetailResponseType>(`/api/gyms/${gymId}`);
	}

	// ジム作成（管理者用）
	async createGym(
		data: CreateGymRequestType,
	): Promise<CreateGymResponseType> {
		return this.fetchApi<CreateGymResponseType>("/api/gyms/admin", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	// ジム更新（管理者用）
	async updateGym(
		gymId: string,
		data: UpdateGymRequestType,
	): Promise<SuccessResponseType> {
		return this.fetchApi<SuccessResponseType>(`/api/gyms/admin/${gymId}`, {
			method: "PATCH",
			body: JSON.stringify(data),
		});
	}

	// ジム削除（管理者用）
	async deleteGym(gymId: string): Promise<SuccessResponseType> {
		return this.fetchApi<SuccessResponseType>(`/api/gyms/admin/${gymId}`, {
			method: "DELETE",
		});
	}
}
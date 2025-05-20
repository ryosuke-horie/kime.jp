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

		try {
			const response = await fetch(url, {
				...options,
				headers: {
					...headersWithAuth,
					...options.headers,
				},
			});

			// レスポンスのクローンを作成（ストリームは一度だけ読み取り可能なため）
			const clonedResponse = response.clone();

			// レスポンスボディをJSONとして解析
			// JSONでないレスポンスの場合はエラーを処理
			let data;
			try {
				data = await response.json();
			} catch (parseError) {
				console.error("JSONパースエラー:", parseError);
				throw new Error("レスポンスの解析に失敗しました");
			}

			if (!response.ok) {
				// HTTPステータスコードに基づいたエラーメッセージ
				const statusMessages: Record<number, string> = {
					400: "リクエストが不正です",
					401: "認証が必要です",
					403: "権限がありません",
					404: "リソースが見つかりません",
					409: "リソースが競合しています",
					500: "サーバーエラーが発生しました",
				};

				// エラーレスポンスを型付きで扱う
				const errorData = data as ErrorResponseType;
				const errorMessage =
					errorData.error || statusMessages[response.status] || "APIエラーが発生しました";

				// エラーオブジェクトにAPIレスポンスデータとステータスコードを含める
				const error = new Error(errorMessage);
				(error as any).status = response.status;
				(error as any).data = errorData;
				(error as any).response = clonedResponse;

				throw error;
			}

			return data as T;
		} catch (error) {
			// fetch自体の失敗（ネットワークエラーなど）
			if (!(error instanceof Error)) {
				throw new Error("ネットワークエラーが発生しました");
			}

			// 既にAPIエラーとして処理済みの場合はそのまま再スロー
			if ((error as any).status) {
				throw error;
			}

			// その他のエラー
			console.error("API呼び出しエラー:", error);
			throw error;
		}
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

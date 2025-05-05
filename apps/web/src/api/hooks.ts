/**
 * このファイルはNext.jsのアプリケーションで使用するためのReact Hooks APIクライアントです。
 * 実際の実装はNext.jsプロジェクト内で React Query や SWR を用いて行います。
 * このファイルはサンプル実装として、APIを型安全に呼び出すためのフックの作り方を示しています。
 */
import {
	API_BASE_URL,
	type CreateGymRequestType,
	type CreateGymResponseType,
	type GymDetailResponseType,
	type GymListResponseType,
	type HealthCheckResponseType,
	type SuccessResponseType,
	type UpdateGymRequestType,
} from "../api-types";

/**
 * 環境設定を取得する（Next.jsアプリケーション内で実装）
 */
const getEnvironment = (): keyof typeof API_BASE_URL => {
	// Next.jsの環境変数に基づいて環境を判定（実際の実装はNext.jsプロジェクト内で行う）
	// @ts-ignore - NODE_ENVはNext.jsのコンテキストで利用可能
	if (
		typeof process !== "undefined" &&
		process.env?.NODE_ENV === "production"
	) {
		return "production";
	}
	// @ts-ignore - NEXT_PUBLIC_USE_STAGINGはNext.jsのコンテキストで利用可能
	if (
		typeof process !== "undefined" &&
		process.env?.NEXT_PUBLIC_USE_STAGING === "true"
	) {
		return "staging";
	}
	return "development";
};

/**
 * API呼び出し用の基本設定
 */
const apiConfig = {
	baseUrl: API_BASE_URL[getEnvironment()],
	headers: {
		"Content-Type": "application/json",
	},
};

// 以下はReact QueryやSWRを使った実装サンプル
// 実際の実装はNext.jsプロジェクト内で行う

/**
 * ヘルスチェックAPI用フック
 */
export const useHealthCheck = () => {
	// React QueryやSWRを使った実装
	// 例: return useQuery<HealthCheckResponseType>(['health'], () => fetchApi('/health'));

	// サンプル実装として同期的に関数を返す
	return {
		fetchHealth: async (): Promise<HealthCheckResponseType> => {
			const response = await fetch(`${apiConfig.baseUrl}/health`, {
				headers: apiConfig.headers,
			});
			return response.json();
		},
	};
};

/**
 * ジム一覧取得API用フック
 */
export const useGyms = () => {
	// React QueryやSWRを使った実装
	// 例: return useQuery<GymListResponseType>(['gyms'], () => fetchApi('/api/gyms/admin'));

	// サンプル実装として同期的に関数を返す
	return {
		fetchGyms: async (page = 1, limit = 20): Promise<GymListResponseType> => {
			const response = await fetch(
				`${apiConfig.baseUrl}/api/gyms/admin?page=${page}&limit=${limit}`,
				{
					headers: apiConfig.headers,
				},
			);
			return response.json();
		},
	};
};

/**
 * ジム詳細取得API用フック
 */
export const useGym = (gymId: string) => {
	// React QueryやSWRを使った実装
	// 例: return useQuery<GymDetailResponseType>(['gym', gymId], () => fetchApi(`/api/gyms/${gymId}`));

	// サンプル実装として同期的に関数を返す
	return {
		fetchGym: async (): Promise<GymDetailResponseType> => {
			const response = await fetch(`${apiConfig.baseUrl}/api/gyms/${gymId}`, {
				headers: apiConfig.headers,
			});
			return response.json();
		},
	};
};

/**
 * ジム作成API用フック
 */
export const useCreateGym = () => {
	// React QueryやSWRを使った実装
	// 例: return useMutation<CreateGymResponseType, Error, CreateGymRequestType>(...)

	// サンプル実装として同期的に関数を返す
	return {
		createGym: async (
			data: CreateGymRequestType,
		): Promise<CreateGymResponseType> => {
			const response = await fetch(`${apiConfig.baseUrl}/api/gyms/admin`, {
				method: "POST",
				headers: apiConfig.headers,
				body: JSON.stringify(data),
			});
			return response.json();
		},
	};
};

/**
 * ジム更新API用フック
 */
export const useUpdateGym = (gymId: string) => {
	// React QueryやSWRを使った実装
	// 例: return useMutation<SuccessResponseType, Error, UpdateGymRequestType>(...)

	// サンプル実装として同期的に関数を返す
	return {
		updateGym: async (
			data: UpdateGymRequestType,
		): Promise<SuccessResponseType> => {
			const response = await fetch(
				`${apiConfig.baseUrl}/api/gyms/admin/${gymId}`,
				{
					method: "PATCH",
					headers: apiConfig.headers,
					body: JSON.stringify(data),
				},
			);
			return response.json();
		},
	};
};

/**
 * ジム削除API用フック
 */
export const useDeleteGym = (gymId: string) => {
	// React QueryやSWRを使った実装
	// 例: return useMutation<SuccessResponseType>(() => fetchApi(`/api/gyms/admin/${gymId}`, { method: 'DELETE' }))

	// サンプル実装として同期的に関数を返す
	return {
		deleteGym: async (): Promise<SuccessResponseType> => {
			const response = await fetch(
				`${apiConfig.baseUrl}/api/gyms/admin/${gymId}`,
				{
					method: "DELETE",
					headers: apiConfig.headers,
				},
			);
			return response.json();
		},
	};
};

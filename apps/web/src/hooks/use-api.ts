import { ApiClient } from "@/api/client";
import { withErrorHandling } from "@/api/with-error-handling";
import type {
	CreateGymRequestType,
	CreateGymResponseType,
	SuccessResponseType,
	UpdateGymRequestType,
} from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

// APIクライアントのインスタンスを作成
const api = new ApiClient("development", undefined, true);

// エラーハンドリングを適用したAPI関数
const healthApi = withErrorHandling(() => api.getHealth(), "ヘルスチェックに失敗しました");
const gymsApi = withErrorHandling(
	(page: number, limit: number) => api.getGyms(page, limit),
	"ジム一覧の取得に失敗しました",
);
const gymApi = withErrorHandling(
	(gymId: string) => api.getGym(gymId),
	"ジム情報の取得に失敗しました",
);
const createGymApi = withErrorHandling(
	(data: CreateGymRequestType) => api.createGym(data),
	"ジムの作成に失敗しました",
);
const updateGymApi = withErrorHandling(
	(gymId: string, data: UpdateGymRequestType) => api.updateGym(gymId, data),
	"ジムの更新に失敗しました",
);
const deleteGymApi = withErrorHandling(
	(gymId: string) => api.deleteGym(gymId),
	"ジムの削除に失敗しました",
);

// ヘルスチェック用のカスタムフック
export function useHealthApi() {
	return useQuery({
		queryKey: ["health"],
		queryFn: healthApi,
	});
}

// ジム一覧取得用のカスタムフック
export function useGymsApi(page = 1, limit = 20) {
	return useQuery({
		queryKey: ["gyms", page, limit],
		queryFn: () => gymsApi(page, limit),
	});
}

// 特定のジム情報取得用のカスタムフック
export function useGymApi(gymId: string) {
	return useQuery({
		queryKey: ["gym", gymId],
		queryFn: () => gymApi(gymId),
		enabled: !!gymId, // gymIdが存在する場合のみクエリを実行
	});
}

// ジム作成用のカスタムフック
export function useCreateGymApi() {
	return useMutation<CreateGymResponseType, Error, CreateGymRequestType>({
		mutationFn: (data) => createGymApi(data) as Promise<CreateGymResponseType>,
	});
}

// ジム更新用のカスタムフック
export function useUpdateGymApi() {
	return useMutation<SuccessResponseType, Error, { gymId: string; data: UpdateGymRequestType }>({
		mutationFn: ({ gymId, data }) => updateGymApi(gymId, data) as Promise<SuccessResponseType>,
	});
}

// ジム削除用のカスタムフック
export function useDeleteGymApi() {
	return useMutation<SuccessResponseType, Error, string>({
		mutationFn: (gymId) => deleteGymApi(gymId) as Promise<SuccessResponseType>,
	});
}

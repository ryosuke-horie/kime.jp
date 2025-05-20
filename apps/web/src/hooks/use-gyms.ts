"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useDeleteGymApi, useGymsApi } from "./use-api";

export interface UseGymsOptions {
	initialPage?: number;
	pageSize?: number;
}

export function useGyms({ initialPage = 1, pageSize = 10 }: UseGymsOptions = {}) {
	const [page, setPage] = useState(initialPage);
	const [searchName, setSearchName] = useState("");

	// APIフックを使用（内部でエラーハンドリングが実装済み）
	const { data, isLoading, isError, error, refetch } = useGymsApi(page, pageSize);

	// 削除ミューテーションフック
	const deleteGymMutation = useDeleteGymApi();

	// 名前でのフィルタリング（サーバー側フィルタリングが実装されるまではクライアント側で行う）
	const filteredGyms = data?.gyms
		? data.gyms.filter(
				(gym) => !searchName || gym.name.toLowerCase().includes(searchName.toLowerCase()),
			)
		: [];

	// ジム削除関数
	const deleteGym = async (gymId: string): Promise<boolean> => {
		try {
			await deleteGymMutation.mutateAsync(gymId);
			toast.success("ジムを削除しました");
			// 削除に成功したら再フェッチ
			await refetch();
			return true;
		} catch (error) {
			// エラーハンドリングは内部で行われるため、ここでは結果だけ返す
			return false;
		}
	};

	// 検索関数
	const searchGyms = (name: string) => {
		setSearchName(name);
		setPage(1); // 検索時は1ページ目に戻る
	};

	// ページ変更関数
	const changePage = (newPage: number) => {
		setPage(newPage);
	};

	// メタデータ処理
	const paginationMeta = data?.meta || {
		total: 0,
		page,
		limit: pageSize,
		totalPages: 0,
	};

	return {
		gyms: filteredGyms,
		paginationMeta,
		isLoading,
		isError,
		error,
		searchGyms,
		changePage,
		deleteGym,
		currentPage: page,
	};
}

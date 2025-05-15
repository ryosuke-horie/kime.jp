"use client";

import { ApiClient } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

// APIクライアントのシングルトンインスタンス
const apiClient = new ApiClient();

export interface UseGymsOptions {
	initialPage?: number;
	pageSize?: number;
}

export function useGyms({ initialPage = 1, pageSize = 10 }: UseGymsOptions = {}) {
	const [page, setPage] = useState(initialPage);
	const [searchName, setSearchName] = useState("");

	// Tanstack Queryを使用してデータ取得
	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ["gyms", page, pageSize, searchName],
		queryFn: async () => {
			const response = await apiClient.getGyms(page, pageSize);

			// 名前でのフィルタリング（サーバー側フィルタリングが実装されるまではクライアント側で行う）
			let filteredGyms = response.gyms;
			if (searchName) {
				filteredGyms = filteredGyms.filter((gym) =>
					gym.name.toLowerCase().includes(searchName.toLowerCase()),
				);
			}

			return {
				gyms: filteredGyms,
				meta: response.meta || {
					total: filteredGyms.length,
					page,
					limit: pageSize,
					totalPages: Math.max(1, Math.ceil(filteredGyms.length / pageSize)),
				},
			};
		},
	});

	// ジム削除関数
	const deleteGym = async (gymId: string): Promise<boolean> => {
		try {
			await apiClient.deleteGym(gymId);
			// 削除に成功したら再フェッチ
			await refetch();
			return true;
		} catch (error) {
			console.error("ジム削除に失敗しました", error);
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

	return {
		gyms: data?.gyms || [],
		paginationMeta: data?.meta || {
			total: 0,
			page,
			limit: pageSize,
			totalPages: 0,
		},
		isLoading,
		isError,
		error,
		searchGyms,
		changePage,
		deleteGym,
		currentPage: page,
	};
}

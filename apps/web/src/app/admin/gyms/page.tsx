"use client";

import { ApiClient } from "@/api/client";
import { DashboardLayout } from "@/components/admin/dashboard-layout";
import { GymPagination } from "@/components/admin/gym-pagination";
import { GymSearch } from "@/components/admin/gym-search";
import { GymTable } from "@/components/admin/gym-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GymType } from "@/types/gym";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminGymsPage() {
	// ステート管理
	const [gyms, setGyms] = useState<GymType[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [paginationMeta, setPaginationMeta] = useState({
		total: 0,
		page: 1,
		limit: 10,
		totalPages: 0,
	});
	const [searchName, setSearchName] = useState("");

	// APIクライアントの初期化
	const apiClient = new ApiClient();

	// データ取得関数
	const fetchGyms = useCallback(
		async (page = 1, name = "") => {
			try {
				setIsLoading(true);
				// 実際のAPIからデータを取得
				const response = await apiClient.getGyms(page, paginationMeta.limit);

				let filteredGyms = response.gyms;

				// クライアントサイドで名前フィルタリング（バックエンドのsearchパラメータがない場合）
				if (name) {
					filteredGyms = filteredGyms.filter((gym) =>
						gym.name.toLowerCase().includes(name.toLowerCase()),
					);
				}

				setGyms(filteredGyms);

				// ページネーションメタデータを更新
				if (response.meta) {
					setPaginationMeta(response.meta);
				}
			} catch (error) {
				console.error("ジムデータの取得に失敗しました", error);
				toast.error("ジム一覧の取得に失敗しました", {
					description: "しばらく経ってからもう一度お試しください",
				});
			} finally {
				setIsLoading(false);
			}
		},
		[paginationMeta.limit, apiClient],
	);

	// 初回読み込み時にデータ取得
	useEffect(() => {
		fetchGyms(1, searchName);
	}, [fetchGyms, searchName]);

	// 検索ハンドラー
	const handleSearch = useCallback(
		(newFilters: { name: string }) => {
			setSearchName(newFilters.name);
			fetchGyms(1, newFilters.name);
		},
		[fetchGyms],
	);

	// ページ切り替えハンドラー
	const handlePageChange = useCallback(
		(page: number) => {
			fetchGyms(page, searchName);
		},
		[fetchGyms, searchName],
	);

	// ジム編集ハンドラー
	const handleEdit = useCallback((gym: GymType) => {
		// 実際の実装では編集ページへリダイレクト
		toast.info(`「${gym.name}」の編集ページへ移動します`);
		// 実装例: router.push(`/admin/gyms/edit/${gym.gymId}`);
	}, []);

	// ジム削除ハンドラー
	const handleDelete = useCallback(
		async (gym: GymType) => {
			try {
				await apiClient.deleteGym(gym.gymId);
				toast.success(`「${gym.name}」を削除しました`);
				// 削除後に再取得
				fetchGyms(paginationMeta.page, searchName);
			} catch (error) {
				console.error("ジム削除に失敗しました", error);
				toast.error(`「${gym.name}」の削除に失敗しました`, {
					description: "しばらく経ってからもう一度お試しください",
				});
			}
		},
		[apiClient, fetchGyms, paginationMeta.page, searchName],
	);

	return (
		<DashboardLayout>
			<div className="flex flex-col gap-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">ジム管理</h1>
						<p className="text-muted-foreground">登録されているジムの一覧表示と管理</p>
					</div>
					<Button asChild>
						<Link href="/admin/gyms/create">
							<PlusIcon className="mr-2 h-4 w-4" />
							新規ジム追加
						</Link>
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>ジム一覧</CardTitle>
						<CardDescription>システムに登録されているすべてのジムを表示しています</CardDescription>
					</CardHeader>
					<CardContent>
						<GymSearch onSearch={handleSearch} />

						<GymTable
							gyms={gyms}
							onEdit={handleEdit}
							onDelete={handleDelete}
							isLoading={isLoading}
						/>

						<GymPagination meta={paginationMeta} onPageChange={handlePageChange} />
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	);
}

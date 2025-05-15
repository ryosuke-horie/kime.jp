"use client";

import { DashboardLayout } from "@/components/admin/dashboard-layout";
import { GymPagination } from "@/components/admin/gym-pagination";
import { GymSearch } from "@/components/admin/gym-search";
import { GymTable } from "@/components/admin/gym-table";
import { useGyms } from "@/hooks/use-gyms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GymType } from "@/types/gym";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";
import { toast } from "sonner";

export default function AdminGymsPage() {
	// カスタムフックを使用してジムデータを取得
	const {
		gyms,
		paginationMeta,
		isLoading,
		searchGyms,
		changePage,
		deleteGym,
	} = useGyms();

	// 検索ハンドラー
	const handleSearch = useCallback(
		(newFilters: { name: string }) => {
			searchGyms(newFilters.name);
		},
		[searchGyms],
	);

	// ページ切り替えハンドラー
	const handlePageChange = useCallback(
		(page: number) => {
			changePage(page);
		},
		[changePage],
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
				const success = await deleteGym(gym.gymId);
				if (success) {
					toast.success(`「${gym.name}」を削除しました`);
				} else {
					throw new Error("削除処理に失敗しました");
				}
			} catch (error) {
				console.error("ジム削除に失敗しました", error);
				toast.error(`「${gym.name}」の削除に失敗しました`, {
					description: "しばらく経ってからもう一度お試しください",
				});
			}
		},
		[deleteGym],
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

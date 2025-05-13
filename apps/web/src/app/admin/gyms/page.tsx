"use client";

import { DashboardLayout } from "@/components/admin/dashboard-layout";
import { GymPagination } from "@/components/admin/gym-pagination";
import { GymSearch } from "@/components/admin/gym-search";
import { GymTable } from "@/components/admin/gym-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockGyms, mockPaginationMeta } from "@/mock/gyms";
import type { GymType } from "@/types/gym";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export default function AdminGymsPage() {
	// ステート管理
	const [gyms, setGyms] = useState(mockGyms);
	const [paginationMeta, setPaginationMeta] = useState(mockPaginationMeta);

	// フィルタリング関数
	const filterGyms = useCallback(
		(name: string) => {
			let filtered = [...mockGyms];

			if (name) {
				filtered = filtered.filter((gym) => gym.name.toLowerCase().includes(name.toLowerCase()));
			}

			setGyms(filtered);

			// ページネーションメタデータを更新
			const totalItems = filtered.length;
			setPaginationMeta({
				...paginationMeta,
				total: totalItems,
				totalPages: Math.max(1, Math.ceil(totalItems / paginationMeta.limit)),
				page: 1, // フィルタリング時は最初のページに戻る
			});
		},
		[paginationMeta],
	);

	// 検索ハンドラー
	const handleSearch = useCallback(
		(newFilters: { name: string }) => {
			filterGyms(newFilters.name);
		},
		[filterGyms],
	);

	// ページ切り替えハンドラー
	const handlePageChange = useCallback((page: number) => {
		setPaginationMeta((prev) => ({
			...prev,
			page,
		}));
		// 実際のAPIでは、ここでページに応じたデータを取得する
	}, []);

	// ジム編集ハンドラー
	const handleEdit = useCallback((gym: GymType) => {
		// 実際の実装では編集ページへリダイレクト
		toast.info(`「${gym.name}」の編集ページへ移動します`, {
			description: "実データ連携時に実装予定です",
		});
	}, []);

	// ジム削除ハンドラー
	const handleDelete = useCallback((gym: GymType) => {
		toast.info(`「${gym.name}」を削除します`, {
			description: "実データ連携時に実装予定です",
		});
	}, []);

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

						<GymTable gyms={gyms} onEdit={handleEdit} onDelete={handleDelete} />

						<GymPagination meta={paginationMeta} onPageChange={handlePageChange} />
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	);
}

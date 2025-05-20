"use client";

import { DashboardLayout } from "@/components/admin/dashboard-layout";
import { DeleteGymDialog } from "@/components/admin/delete-gym-dialog";
import { GymPagination } from "@/components/admin/gym-pagination";
import { GymSearch } from "@/components/admin/gym-search";
import { GymTable } from "@/components/admin/gym-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGyms } from "@/hooks/use-gyms";
import type { GymType } from "@/types/gym";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export default function AdminGymsPage() {
	const router = useRouter();
	// カスタムフックを使用してジムデータを取得
	const { gyms, paginationMeta, isLoading, searchGyms, changePage, deleteGym } = useGyms();
	// 削除確認モーダルの状態管理
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [gymToDelete, setGymToDelete] = useState<GymType | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

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
	const handleEdit = useCallback(
		(gym: GymType) => {
			// 編集ページへリダイレクト
			router.push(`/admin/gyms/${gym.gymId}/edit`);
		},
		[router],
	);

	// 削除ボタンクリック時のハンドラー
	const handleDeleteClick = useCallback((gym: GymType) => {
		// 削除対象のジムを設定
		setGymToDelete(gym);
		// 確認ダイアログを表示
		setIsDeleteDialogOpen(true);
	}, []);

	// 削除実行ハンドラー
	const handleDeleteConfirm = useCallback(
		async (gym: GymType) => {
			setIsDeleting(true);
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
			} finally {
				setIsDeleting(false);
				setIsDeleteDialogOpen(false);
				setGymToDelete(null);
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
							onDelete={handleDeleteClick}
							isLoading={isLoading}
						/>

						<GymPagination meta={paginationMeta} onPageChange={handlePageChange} />
					</CardContent>
				</Card>

				{/* 削除確認ダイアログ */}
				<DeleteGymDialog
					gym={gymToDelete}
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
					onConfirm={handleDeleteConfirm}
					isDeleting={isDeleting}
				/>
			</div>
		</DashboardLayout>
	);
}

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { GymType } from "@/types/gym";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import React, { useState } from "react";

// 日付フォーマット用ヘルパー関数
const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("ja-JP", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
};

// ソート用の型定義
type SortDirection = "asc" | "desc" | null;
type SortField = "name" | "ownerEmail" | "createdAt" | null;

interface GymTableProps {
	gyms: GymType[];
	onEdit?: (gym: GymType) => void;
	onDelete?: (gym: GymType) => void;
	isLoading?: boolean;
}

export function GymTable({ gyms, onEdit, onDelete, isLoading = false }: GymTableProps) {
	// ソート状態の管理
	const [sortField, setSortField] = useState<SortField>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>(null);

	// ソート切り替えハンドラー
	const handleSort = (field: SortField) => {
		if (sortField === field) {
			// 同じフィールドをクリックした場合は方向を切り替え
			const nextDirection =
				sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc";
			setSortDirection(nextDirection);
			if (nextDirection === null) {
				setSortField(null);
			}
		} else {
			// 新しいフィールドをクリックした場合は昇順からスタート
			setSortField(field);
			setSortDirection("asc");
		}
	};

	// ジムデータをソート
	const sortedGyms = [...gyms].sort((a, b) => {
		if (!sortField || !sortDirection) return 0;

		let valueA = a[sortField];
		let valueB = b[sortField];

		// 日付の場合は特別な処理
		if (sortField === "createdAt") {
			valueA = new Date(valueA).getTime().toString();
			valueB = new Date(valueB).getTime().toString();
		}

		// 文字列に変換して比較
		const strA = String(valueA).toLowerCase();
		const strB = String(valueB).toLowerCase();

		if (sortDirection === "asc") {
			return strA > strB ? 1 : strA < strB ? -1 : 0;
		}
		return strA < strB ? 1 : strA > strB ? -1 : 0;
	});

	// ソートアイコンを表示するヘルパー関数
	const renderSortIndicator = (field: SortField) => {
		if (sortField !== field) return null;

		return (
			<span className="ml-1">
				{sortDirection === "asc" ? "↑" : sortDirection === "desc" ? "↓" : ""}
			</span>
		);
	};

	// ローディングスケルトン - PC版
	const renderPCLoadingSkeleton = () => {
		// 静的な配列 - パフォーマンス上の問題はありません
		const skeletonRows = [
			"skeleton-row-1",
			"skeleton-row-2",
			"skeleton-row-3",
			"skeleton-row-4",
			"skeleton-row-5",
		];

		return (
			<>
				{skeletonRows.map((key) => (
					<TableRow key={key}>
						<TableCell>
							<Skeleton className="h-5 w-[180px]" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-5 w-[250px]" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-5 w-[100px]" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-8 w-8 rounded-full" />
						</TableCell>
					</TableRow>
				))}
			</>
		);
	};

	// ローディングスケルトン - モバイル版
	const renderMobileLoadingSkeleton = () => {
		// 静的な配列 - パフォーマンス上の問題はありません
		const skeletonItems = ["mobile-skeleton-1", "mobile-skeleton-2", "mobile-skeleton-3"];

		return (
			<div className="grid gap-4 p-4">
				{skeletonItems.map((key) => (
					<div key={key} className="rounded-lg border p-4 shadow-sm">
						<div className="flex items-center justify-between">
							<Skeleton className="h-5 w-[150px]" />
							<Skeleton className="h-8 w-8 rounded-full" />
						</div>
						<div className="mt-2 grid gap-2">
							<div className="grid grid-cols-3 items-center">
								<span className="text-muted-foreground">メール:</span>
								<Skeleton className="col-span-2 h-4 w-full" />
							</div>
							<div className="grid grid-cols-3 items-center">
								<span className="text-muted-foreground">登録日:</span>
								<Skeleton className="col-span-2 h-4 w-[100px]" />
							</div>
						</div>
					</div>
				))}
			</div>
		);
	};

	// データなし
	const renderEmptyState = (isMobile = false) => (
		<div className={`${isMobile ? "" : "h-24"} text-center py-8 text-muted-foreground`}>
			ジムの登録がありません
		</div>
	);

	return (
		<div className="rounded-md border">
			{/* PC版テーブル - md以上のサイズで表示 */}
			<div className="hidden md:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
								ジム名{renderSortIndicator("name")}
							</TableHead>
							<TableHead className="cursor-pointer" onClick={() => handleSort("ownerEmail")}>
								オーナーメール{renderSortIndicator("ownerEmail")}
							</TableHead>
							<TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
								登録日{renderSortIndicator("createdAt")}
							</TableHead>
							<TableHead className="w-[70px]">アクション</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							renderPCLoadingSkeleton()
						) : sortedGyms.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} className="h-24 text-center">
									ジムの登録がありません
								</TableCell>
							</TableRow>
						) : (
							sortedGyms.map((gym) => (
								<TableRow key={gym.gymId}>
									<TableCell className="font-medium">{gym.name}</TableCell>
									<TableCell>{gym.ownerEmail}</TableCell>
									<TableCell>{formatDate(gym.createdAt)}</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<span className="sr-only">メニューを開く</span>
													<EllipsisVerticalIcon className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => onEdit?.(gym)}>
													<PencilIcon className="mr-2 h-4 w-4" />
													<span>編集</span>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem className="text-red-600" onClick={() => onDelete?.(gym)}>
													<TrashIcon className="mr-2 h-4 w-4" />
													<span>削除</span>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* モバイル版カードレイアウト - md未満のサイズで表示 */}
			<div className="block md:hidden">
				{isLoading ? (
					renderMobileLoadingSkeleton()
				) : sortedGyms.length === 0 ? (
					renderEmptyState(true)
				) : (
					<div className="grid gap-4 p-4">
						{sortedGyms.map((gym) => (
							<div key={gym.gymId} className="rounded-lg border p-4 shadow-sm">
								<div className="flex items-center justify-between">
									<h3 className="font-semibold">{gym.name}</h3>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" className="h-8 w-8 p-0">
												<span className="sr-only">メニューを開く</span>
												<EllipsisVerticalIcon className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => onEdit?.(gym)}>
												<PencilIcon className="mr-2 h-4 w-4" />
												<span>編集</span>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem className="text-red-600" onClick={() => onDelete?.(gym)}>
												<TrashIcon className="mr-2 h-4 w-4" />
												<span>削除</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								<div className="mt-2 grid gap-1 text-sm">
									<div className="grid grid-cols-3 items-center">
										<span className="text-muted-foreground">メール:</span>
										<span className="col-span-2 truncate">{gym.ownerEmail}</span>
									</div>
									<div className="grid grid-cols-3 items-center">
										<span className="text-muted-foreground">登録日:</span>
										<span className="col-span-2">{formatDate(gym.createdAt)}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

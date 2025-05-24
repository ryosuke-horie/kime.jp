"use client";

import { Badge } from "@/components/ui/badge";
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
import type { StaffType } from "@/types/staff";
import { EllipsisVerticalIcon, KeyIcon, PencilIcon, TrashIcon, UserIcon } from "lucide-react";
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

// ロール表示用ヘルパー関数
const getRoleDisplay = (role: string) => {
	switch (role) {
		case "owner":
			return "オーナー";
		case "staff":
			return "スタッフ";
		default:
			return role;
	}
};

// ステータス表示用ヘルパー関数
const getStatusBadge = (isActive: boolean) => {
	return isActive ? (
		<Badge variant="default" className="bg-green-100 text-green-800">
			アクティブ
		</Badge>
	) : (
		<Badge variant="secondary" className="bg-gray-100 text-gray-600">
			非アクティブ
		</Badge>
	);
};

// ソート用の型定義
type SortDirection = "asc" | "desc" | null;
type SortField = "name" | "email" | "role" | "createdAt" | "isActive" | null;

interface StaffTableProps {
	staff: StaffType[];
	onEdit?: (staff: StaffType) => void;
	onDelete?: (staff: StaffType) => void;
	onChangePassword?: (staff: StaffType) => void;
	isLoading?: boolean;
	currentUserId?: string; // 現在のユーザーID（自分自身の削除を防ぐため）
}

export function StaffTable({
	staff,
	onEdit,
	onDelete,
	onChangePassword,
	isLoading = false,
	currentUserId,
}: StaffTableProps) {
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

	// スタッフデータをソート
	const sortedStaff = [...staff].sort((a, b) => {
		if (!sortField || !sortDirection) return 0;

		let valueA: any = a[sortField];
		let valueB: any = b[sortField];

		// 日付の場合は特別な処理
		if (sortField === "createdAt") {
			valueA = new Date(valueA).getTime();
			valueB = new Date(valueB).getTime();
		}

		// ブール値の場合は特別な処理
		if (sortField === "isActive") {
			valueA = a.isActive ? 1 : 0;
			valueB = b.isActive ? 1 : 0;
		}

		// 文字列に変換して比較（ブール値以外）
		if (sortField !== "isActive" && sortField !== "createdAt") {
			valueA = String(valueA).toLowerCase();
			valueB = String(valueB).toLowerCase();
		}

		if (sortDirection === "asc") {
			return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
		}
		return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
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
							<Skeleton className="h-5 w-[140px]" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-5 w-[220px]" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-5 w-[80px]" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-6 w-[90px] rounded-full" />
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
							<Skeleton className="h-5 w-[120px]" />
							<Skeleton className="h-8 w-8 rounded-full" />
						</div>
						<div className="mt-2 grid gap-2">
							<div className="grid grid-cols-3 items-center">
								<span className="text-muted-foreground">メール:</span>
								<Skeleton className="col-span-2 h-4 w-full" />
							</div>
							<div className="grid grid-cols-3 items-center">
								<span className="text-muted-foreground">ロール:</span>
								<Skeleton className="col-span-2 h-4 w-[60px]" />
							</div>
							<div className="grid grid-cols-3 items-center">
								<span className="text-muted-foreground">ステータス:</span>
								<Skeleton className="col-span-2 h-6 w-[80px] rounded-full" />
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
			スタッフが登録されていません
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
								氏名{renderSortIndicator("name")}
							</TableHead>
							<TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
								メールアドレス{renderSortIndicator("email")}
							</TableHead>
							<TableHead className="cursor-pointer" onClick={() => handleSort("role")}>
								ロール{renderSortIndicator("role")}
							</TableHead>
							<TableHead className="cursor-pointer" onClick={() => handleSort("isActive")}>
								ステータス{renderSortIndicator("isActive")}
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
						) : sortedStaff.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									スタッフが登録されていません
								</TableCell>
							</TableRow>
						) : (
							sortedStaff.map((staffMember) => (
								<TableRow key={staffMember.id}>
									<TableCell className="font-medium">{staffMember.name}</TableCell>
									<TableCell>{staffMember.email}</TableCell>
									<TableCell>{getRoleDisplay(staffMember.role)}</TableCell>
									<TableCell>{getStatusBadge(staffMember.isActive)}</TableCell>
									<TableCell>{formatDate(staffMember.createdAt)}</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<span className="sr-only">メニューを開く</span>
													<EllipsisVerticalIcon className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => onEdit?.(staffMember)}>
													<PencilIcon className="mr-2 h-4 w-4" />
													<span>編集</span>
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => onChangePassword?.(staffMember)}>
													<KeyIcon className="mr-2 h-4 w-4" />
													<span>パスワード変更</span>
												</DropdownMenuItem>
												{currentUserId !== staffMember.id && (
													<>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-red-600"
															onClick={() => onDelete?.(staffMember)}
														>
															<TrashIcon className="mr-2 h-4 w-4" />
															<span>削除</span>
														</DropdownMenuItem>
													</>
												)}
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
				) : sortedStaff.length === 0 ? (
					renderEmptyState(true)
				) : (
					<div className="grid gap-4 p-4">
						{sortedStaff.map((staffMember) => (
							<div key={staffMember.id} className="rounded-lg border p-4 shadow-sm">
								<div className="flex items-center justify-between">
									<h3 className="font-semibold flex items-center">
										<UserIcon className="mr-2 h-4 w-4" />
										{staffMember.name}
									</h3>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" className="h-8 w-8 p-0">
												<span className="sr-only">メニューを開く</span>
												<EllipsisVerticalIcon className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => onEdit?.(staffMember)}>
												<PencilIcon className="mr-2 h-4 w-4" />
												<span>編集</span>
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => onChangePassword?.(staffMember)}>
												<KeyIcon className="mr-2 h-4 w-4" />
												<span>パスワード変更</span>
											</DropdownMenuItem>
											{currentUserId !== staffMember.id && (
												<>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-red-600"
														onClick={() => onDelete?.(staffMember)}
													>
														<TrashIcon className="mr-2 h-4 w-4" />
														<span>削除</span>
													</DropdownMenuItem>
												</>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								<div className="mt-2 grid gap-1 text-sm">
									<div className="grid grid-cols-3 items-center">
										<span className="text-muted-foreground">メール:</span>
										<span className="col-span-2 truncate">{staffMember.email}</span>
									</div>
									<div className="grid grid-cols-3 items-center">
										<span className="text-muted-foreground">ロール:</span>
										<span className="col-span-2">{getRoleDisplay(staffMember.role)}</span>
									</div>
									<div className="grid grid-cols-3 items-center">
										<span className="text-muted-foreground">ステータス:</span>
										<span className="col-span-2">{getStatusBadge(staffMember.isActive)}</span>
									</div>
									<div className="grid grid-cols-3 items-center">
										<span className="text-muted-foreground">登録日:</span>
										<span className="col-span-2">{formatDate(staffMember.createdAt)}</span>
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

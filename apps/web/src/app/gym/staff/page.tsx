"use client";

import { PasswordChangeForm } from "@/components/gym/password-change-form";
import { StaffForm } from "@/components/gym/staff-form";
import { StaffTable } from "@/components/gym/staff-table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGymAuth } from "@/hooks/use-gym-auth";
import type {
	PasswordChangeRequest,
	StaffCreateRequest,
	StaffCreateResponse,
	StaffListResponse,
	StaffType,
	StaffUpdateRequest,
} from "@/types/staff";
import { PlusIcon, RefreshCwIcon, SearchIcon } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface StaffPageState {
	staff: StaffType[];
	isLoading: boolean;
	searchTerm: string;
	selectedStaff: StaffType | null;
	showCreateForm: boolean;
	showEditForm: boolean;
	showPasswordForm: boolean;
	showDeleteDialog: boolean;
	temporaryPassword?: string;
}

export default function StaffPage() {
	const { user, token } = useGymAuth();

	const [state, setState] = useState<StaffPageState>({
		staff: [],
		isLoading: false,
		searchTerm: "",
		selectedStaff: null,
		showCreateForm: false,
		showEditForm: false,
		showPasswordForm: false,
		showDeleteDialog: false,
	});

	// 状態更新ヘルパー
	const updateState = (updates: Partial<StaffPageState>) => {
		setState((prev) => ({ ...prev, ...updates }));
	};

	// スタッフ一覧を取得
	const fetchStaff = React.useCallback(async () => {
		updateState({ isLoading: true });
		try {
			const response = await fetch("/api/staff", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("スタッフ一覧の取得に失敗しました");
			}

			const data: StaffListResponse = await response.json();
			updateState({ staff: data.staff });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "スタッフ一覧の取得に失敗しました");
		} finally {
			updateState({ isLoading: false });
		}
	}, [token]);

	// 初回データ取得
	React.useEffect(() => {
		if (token) {
			fetchStaff();
		}
	}, [token, fetchStaff]);

	// スタッフ検索用のフィルタリング
	const filteredStaff = state.staff.filter((staff) => {
		const searchLower = state.searchTerm.toLowerCase();
		return (
			staff.name.toLowerCase().includes(searchLower) ||
			staff.email.toLowerCase().includes(searchLower)
		);
	});

	// スタッフ作成
	const handleCreateStaff = async (data: StaffCreateRequest) => {
		try {
			const response = await fetch("/api/staff", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json() as { error?: string };
				throw new Error(errorData.error || "スタッフの作成に失敗しました");
			}

			const responseData: StaffCreateResponse = await response.json();

			toast.success("スタッフが正常に作成されました");

			// 一時パスワードを表示状態に設定
			updateState({
				temporaryPassword: responseData.staff.temporaryPassword,
			});

			// スタッフ一覧を更新
			await fetchStaff();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "スタッフの作成に失敗しました");
		}
	};

	// スタッフ更新
	const handleUpdateStaff = async (data: StaffUpdateRequest) => {
		if (!state.selectedStaff) return;

		try {
			const response = await fetch(`/api/staff/${state.selectedStaff.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json() as { error?: string };
				throw new Error(errorData.error || "スタッフの更新に失敗しました");
			}

			toast.success("スタッフ情報が正常に更新されました");

			updateState({ showEditForm: false, selectedStaff: null });
			await fetchStaff();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "スタッフの更新に失敗しました");
		}
	};

	// スタッフ削除
	const handleDeleteStaff = async () => {
		if (!state.selectedStaff) return;

		try {
			const response = await fetch(`/api/staff/${state.selectedStaff.id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const errorData = await response.json() as { error?: string };
				throw new Error(errorData.error || "スタッフの削除に失敗しました");
			}

			toast.success("スタッフが正常に削除されました");

			updateState({ showDeleteDialog: false, selectedStaff: null });
			await fetchStaff();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "スタッフの削除に失敗しました");
		}
	};

	// パスワード変更
	const handleChangePassword = async (data: PasswordChangeRequest) => {
		if (!state.selectedStaff) return;

		try {
			const response = await fetch(`/api/staff/${state.selectedStaff.id}/password`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json() as { error?: string };
				throw new Error(errorData.error || "パスワードの変更に失敗しました");
			}

			toast.success("パスワードが正常に変更されました");

			updateState({ showPasswordForm: false, selectedStaff: null });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "パスワードの変更に失敗しました");
		}
	};

	// イベントハンドラー
	const handleEditStaff = (staff: StaffType) => {
		updateState({ selectedStaff: staff, showEditForm: true });
	};

	const handleDeleteClick = (staff: StaffType) => {
		updateState({ selectedStaff: staff, showDeleteDialog: true });
	};

	const handlePasswordClick = (staff: StaffType) => {
		updateState({ selectedStaff: staff, showPasswordForm: true });
	};

	const handleCloseCreateForm = () => {
		updateState({
			showCreateForm: false,
			temporaryPassword: undefined,
		});
	};

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="flex flex-col space-y-6">
				{/* ヘッダー */}
				<div className="flex flex-col space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">スタッフ管理</h1>
					<p className="text-muted-foreground">
						ジムのスタッフを管理し、アカウントの作成・編集・削除を行えます。
					</p>
				</div>

				{/* 統計カード */}
				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">総スタッフ数</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{state.staff.length}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">アクティブスタッフ</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{state.staff.filter((s) => s.isActive).length}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">オーナー</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{state.staff.filter((s) => s.role === "owner").length}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* 操作バー */}
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center sm:justify-between">
							<div className="flex flex-1 space-x-2">
								<div className="relative flex-1 max-w-sm">
									<SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="スタッフを検索..."
										value={state.searchTerm}
										onChange={(e) => updateState({ searchTerm: e.target.value })}
										className="pl-8"
									/>
								</div>
								<Button variant="outline" onClick={fetchStaff} disabled={state.isLoading}>
									<RefreshCwIcon className="h-4 w-4" />
								</Button>
							</div>
							<Button
								onClick={() => updateState({ showCreateForm: true })}
								disabled={state.isLoading}
							>
								<PlusIcon className="h-4 w-4 mr-2" />
								スタッフを追加
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* スタッフテーブル */}
				<Card>
					<CardHeader>
						<CardTitle>スタッフ一覧</CardTitle>
						<CardDescription>
							登録されているスタッフの一覧です。編集や削除、パスワード変更を行えます。
						</CardDescription>
					</CardHeader>
					<CardContent>
						<StaffTable
							staff={filteredStaff}
							onEdit={handleEditStaff}
							onDelete={handleDeleteClick}
							onChangePassword={handlePasswordClick}
							isLoading={state.isLoading}
							currentUserId={user?.id}
						/>
					</CardContent>
				</Card>
			</div>

			{/* スタッフ作成フォーム */}
			<StaffForm
				isOpen={state.showCreateForm}
				onClose={handleCloseCreateForm}
				onSubmit={handleCreateStaff as (data: StaffCreateRequest | StaffUpdateRequest) => Promise<void>}
				isLoading={state.isLoading}
				mode="create"
				temporaryPassword={state.temporaryPassword}
			/>

			{/* スタッフ編集フォーム */}
			<StaffForm
				isOpen={state.showEditForm}
				onClose={() => updateState({ showEditForm: false, selectedStaff: null })}
				onSubmit={handleUpdateStaff}
				staff={state.selectedStaff || undefined}
				isLoading={state.isLoading}
				mode="edit"
			/>

			{/* パスワード変更フォーム */}
			{state.selectedStaff && (
				<PasswordChangeForm
					isOpen={state.showPasswordForm}
					onClose={() => updateState({ showPasswordForm: false, selectedStaff: null })}
					onSubmit={handleChangePassword}
					staff={state.selectedStaff}
					isLoading={state.isLoading}
					isOwnerAction={user?.role === "owner"}
					currentUserId={user?.id}
				/>
			)}

			{/* 削除確認ダイアログ */}
			<AlertDialog
				open={state.showDeleteDialog}
				onOpenChange={(open) =>
					!open && updateState({ showDeleteDialog: false, selectedStaff: null })
				}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>スタッフを削除しますか？</AlertDialogTitle>
						<AlertDialogDescription>
							{state.selectedStaff && (
								<>
									<strong>{state.selectedStaff.name}</strong>（{state.selectedStaff.email}
									）を削除します。 この操作は取り消すことができません。
								</>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>キャンセル</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteStaff}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							削除
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

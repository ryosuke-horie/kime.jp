"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { StaffCreateRequest, StaffType, StaffUpdateRequest } from "@/types/staff";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// スタッフ作成用のバリデーションスキーマ
const createStaffSchema = z.object({
	name: z.string().min(1, "名前は必須です").max(100, "名前は100文字以内で入力してください"),
	email: z.string().email("有効なメールアドレスを入力してください"),
});

// スタッフ更新用のバリデーションスキーマ
const updateStaffSchema = z.object({
	name: z.string().min(1, "名前は必須です").max(100, "名前は100文字以内で入力してください"),
	email: z.string().email("有効なメールアドレスを入力してください"),
	isActive: z.boolean(),
});

type CreateStaffFormData = z.infer<typeof createStaffSchema>;
type UpdateStaffFormData = z.infer<typeof updateStaffSchema>;

interface StaffFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: StaffCreateRequest | StaffUpdateRequest) => Promise<void>;
	staff?: StaffType; // 編集時に渡される既存スタッフデータ
	isLoading?: boolean;
	temporaryPassword?: string; // 作成後に表示する一時パスワード
	mode: "create" | "edit";
}

export function StaffForm({
	isOpen,
	onClose,
	onSubmit,
	staff,
	isLoading = false,
	temporaryPassword,
	mode,
}: StaffFormProps) {
	const [showPassword, setShowPassword] = useState(false);
	const [passwordCopied, setPasswordCopied] = useState(false);

	const isEditMode = mode === "edit";
	const isCreateMode = mode === "create";

	// フォーム設定
	const createForm = useForm<CreateStaffFormData>({
		// @ts-ignore TypeScriptの型推論の深度問題であり、実行時には問題なし
		resolver: zodResolver(createStaffSchema),
		defaultValues: {
			name: "",
			email: "",
		},
	});

	const updateForm = useForm<UpdateStaffFormData>({
		// @ts-ignore TypeScriptの型推論の深度問題であり、実行時には問題なし
		resolver: zodResolver(updateStaffSchema),
		defaultValues: {
			name: staff?.name || "",
			email: staff?.email || "",
			isActive: staff?.isActive ?? true,
		},
	});

	// フォームを選択（型の問題を回避するためコメントアウト）
	// const form = isEditMode ? updateForm : createForm;
	// const formControl = isEditMode ? updateForm.control : createForm.control;

	// スタッフデータが変更されたときにフォームを更新
	React.useEffect(() => {
		if (isEditMode && staff) {
			updateForm.reset({
				name: staff.name,
				email: staff.email,
				isActive: staff.isActive,
			});
		}
	}, [staff, isEditMode, updateForm]);

	// ダイアログが閉じられるときにフォームをリセット
	React.useEffect(() => {
		if (!isOpen) {
			createForm.reset();
			updateForm.reset();
			setShowPassword(false);
			setPasswordCopied(false);
		}
	}, [isOpen, createForm, updateForm]);

	// フォーム送信ハンドラー
	const handleCreateSubmit = async (data: CreateStaffFormData) => {
		const createData: StaffCreateRequest = {
			name: data.name,
			email: data.email,
			role: "staff",
		};
		await onSubmit(createData);
	};

	const handleUpdateSubmit = async (data: UpdateStaffFormData) => {
		const updateData: StaffUpdateRequest = {
			name: data.name,
			email: data.email,
			isActive: data.isActive,
		};
		await onSubmit(updateData);
	};

	// パスワードをクリップボードにコピー
	const handleCopyPassword = async () => {
		if (temporaryPassword) {
			try {
				await navigator.clipboard.writeText(temporaryPassword);
				setPasswordCopied(true);
				setTimeout(() => setPasswordCopied(false), 2000);
			} catch (error) {
				console.error("パスワードのコピーに失敗しました:", error);
			}
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{isCreateMode ? "スタッフを追加" : "スタッフ情報を編集"}</DialogTitle>
					<DialogDescription>
						{isCreateMode
							? "新しいスタッフの情報を入力してください。登録後に一時パスワードが発行されます。"
							: "スタッフの情報を更新してください。"}
					</DialogDescription>
				</DialogHeader>

				{/* 一時パスワード表示（作成成功後） */}
				{temporaryPassword && (
					<Alert className="mb-4 border-green-200 bg-green-50">
						<AlertDescription>
							<div className="space-y-2">
								<p className="font-semibold text-green-800">スタッフが正常に作成されました！</p>
								<p className="text-sm text-green-700">
									一時パスワードをスタッフに共有してください：
								</p>
								<Card>
									<CardContent className="p-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-2">
												<code className="bg-gray-100 px-2 py-1 rounded text-sm">
													{showPassword ? temporaryPassword : "••••••••"}
												</code>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => setShowPassword(!showPassword)}
												>
													{showPassword ? (
														<EyeOffIcon className="h-4 w-4" />
													) : (
														<EyeIcon className="h-4 w-4" />
													)}
												</Button>
											</div>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={handleCopyPassword}
												disabled={passwordCopied}
											>
												{passwordCopied ? (
													<CheckIcon className="h-4 w-4" />
												) : (
													<CopyIcon className="h-4 w-4" />
												)}
												{passwordCopied ? "コピー済み" : "コピー"}
											</Button>
										</div>
									</CardContent>
								</Card>
								<p className="text-xs text-green-600">
									※ スタッフは初回ログイン時にパスワードの変更が必要です
								</p>
							</div>
						</AlertDescription>
					</Alert>
				)}

				{isCreateMode ? (
					<Form {...createForm}>
						<form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
							<FormField
								control={createForm.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>氏名 *</FormLabel>
										<FormControl>
											<Input placeholder="田中太郎" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={createForm.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>メールアドレス *</FormLabel>
										<FormControl>
											<Input type="email" placeholder="staff@example.com" {...field} />
										</FormControl>
										<FormDescription>
											ログイン時に使用するメールアドレスを入力してください
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<DialogFooter>
								<Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
									キャンセル
								</Button>
								<Button type="submit" disabled={isLoading}>
									{isLoading ? "処理中..." : "スタッフを追加"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				) : (
					<Form {...updateForm}>
						<form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="space-y-4">
							<FormField
								control={updateForm.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>氏名 *</FormLabel>
										<FormControl>
											<Input placeholder="田中太郎" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={updateForm.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>メールアドレス *</FormLabel>
										<FormControl>
											<Input type="email" placeholder="staff@example.com" {...field} />
										</FormControl>
										<FormDescription>
											ログイン時に使用するメールアドレスを入力してください
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={updateForm.control}
								name="isActive"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">アクティブ状態</FormLabel>
											<FormDescription>
												無効にするとスタッフはログインできなくなります
											</FormDescription>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>

							<DialogFooter>
								<Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
									キャンセル
								</Button>
								<Button type="submit" disabled={isLoading}>
									{isLoading ? "処理中..." : "変更を保存"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				)}
			</DialogContent>
		</Dialog>
	);
}

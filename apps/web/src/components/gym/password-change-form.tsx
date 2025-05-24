"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import type { PasswordChangeRequest, StaffType } from "@/types/staff";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangleIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// パスワード変更用のバリデーションスキーマ
const passwordChangeSchema = z
	.object({
		currentPassword: z.string().optional(),
		newPassword: z
			.string()
			.min(8, "パスワードは8文字以上で入力してください")
			.max(100, "パスワードは100文字以内で入力してください")
			.regex(/[a-zA-Z]/, "パスワードには英文字を含めてください")
			.regex(/\d/, "パスワードには数字を含めてください"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "確認用パスワードが一致しません",
		path: ["confirmPassword"],
	});

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

interface PasswordChangeFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: PasswordChangeRequest) => Promise<void>;
	staff: StaffType;
	isLoading?: boolean;
	isOwnerAction?: boolean; // オーナーが他のスタッフのパスワードを変更する場合
	currentUserId?: string; // 現在のユーザーID
}

export function PasswordChangeForm({
	isOpen,
	onClose,
	onSubmit,
	staff,
	isLoading = false,
	isOwnerAction = false,
	currentUserId,
}: PasswordChangeFormProps) {
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// オーナーが他のスタッフのパスワードを変更する場合は現在のパスワードは不要
	const requireCurrentPassword = !isOwnerAction || currentUserId === staff.id;

	// フォーム設定
	const form = useForm<PasswordChangeFormData>({
		resolver: zodResolver(passwordChangeSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	// ダイアログが閉じられるときにフォームをリセット
	React.useEffect(() => {
		if (!isOpen) {
			form.reset();
			setShowCurrentPassword(false);
			setShowNewPassword(false);
			setShowConfirmPassword(false);
		}
	}, [isOpen, form]);

	// フォーム送信ハンドラー
	const handleSubmit = async (data: PasswordChangeFormData) => {
		const changeData: PasswordChangeRequest = {
			newPassword: data.newPassword,
		};

		// 現在のパスワードが必要な場合のみ追加
		if (requireCurrentPassword && data.currentPassword) {
			changeData.currentPassword = data.currentPassword;
		}

		await onSubmit(changeData);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[450px]">
				<DialogHeader>
					<DialogTitle>パスワード変更</DialogTitle>
					<DialogDescription>
						{isOwnerAction && currentUserId !== staff.id
							? `${staff.name}さんのパスワードを変更します。`
							: "現在のパスワードと新しいパスワードを入力してください。"}
					</DialogDescription>
				</DialogHeader>

				{/* 注意事項 */}
				<Alert>
					<AlertTriangleIcon className="h-4 w-4" />
					<AlertDescription>
						<div className="space-y-1">
							<p className="font-semibold">パスワード要件：</p>
							<ul className="text-sm list-disc list-inside space-y-1">
								<li>8文字以上100文字以内</li>
								<li>英文字を含む</li>
								<li>数字を含む</li>
							</ul>
						</div>
					</AlertDescription>
				</Alert>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						{requireCurrentPassword && (
							<FormField
								control={form.control}
								name="currentPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>現在のパスワード *</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showCurrentPassword ? "text" : "password"}
													placeholder="現在のパスワードを入力"
													{...field}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
													onClick={() => setShowCurrentPassword(!showCurrentPassword)}
												>
													{showCurrentPassword ? (
														<EyeOffIcon className="h-4 w-4" />
													) : (
														<EyeIcon className="h-4 w-4" />
													)}
												</Button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<FormField
							control={form.control}
							name="newPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>新しいパスワード *</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type={showNewPassword ? "text" : "password"}
												placeholder="新しいパスワードを入力"
												{...field}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowNewPassword(!showNewPassword)}
											>
												{showNewPassword ? (
													<EyeOffIcon className="h-4 w-4" />
												) : (
													<EyeIcon className="h-4 w-4" />
												)}
											</Button>
										</div>
									</FormControl>
									<FormDescription>8文字以上で、英文字と数字を含めてください</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>パスワード確認 *</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type={showConfirmPassword ? "text" : "password"}
												placeholder="新しいパスワードを再入力"
												{...field}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											>
												{showConfirmPassword ? (
													<EyeOffIcon className="h-4 w-4" />
												) : (
													<EyeIcon className="h-4 w-4" />
												)}
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
								キャンセル
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? "変更中..." : "パスワードを変更"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

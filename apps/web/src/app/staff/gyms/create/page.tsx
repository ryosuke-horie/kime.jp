"use client";

import { ApiClient, type CreateGymAccountRequest, GymApiClient } from "@/api";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Building, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// フォームのバリデーションスキーマ
const formSchema = z.object({
	name: z
		.string()
		.min(2, { message: "ジム名は2文字以上で入力してください" })
		.max(100, { message: "ジム名は100文字以内で入力してください" }),
	phoneNumber: z
		.string()
		.min(6, { message: "電話番号は6文字以上で入力してください" })
		.max(20, { message: "電話番号は20文字以内で入力してください" })
		.regex(/^[0-9\-+()（）]+$/, { message: "有効な電話番号を入力してください" }),
	ownerName: z
		.string()
		.min(2, { message: "オーナー名は2文字以上で入力してください" })
		.max(50, { message: "オーナー名は50文字以内で入力してください" }),
	ownerEmail: z.string().email({ message: "有効なメールアドレスを入力してください" }),
	password: z
		.string()
		.min(8, { message: "パスワードは8文字以上で入力してください" })
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
			message: "パスワードは大文字、小文字、数字を含む必要があります",
		}),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateGymPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// React Hook Formの設定
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			phoneNumber: "",
			ownerName: "",
			ownerEmail: "",
			password: "",
		},
	});

	// フォーム送信ハンドラ
	const onSubmit = async (data: FormValues) => {
		setError(null);
		setSuccess(null);

		// APIリクエスト用データ準備
		const gymData: CreateGymAccountRequest = {
			name: data.name,
			phoneNumber: data.phoneNumber,
			ownerEmail: data.ownerEmail,
			ownerName: data.ownerName,
			password: data.password,
		};

		try {
			// APIクライアントを初期化してジムアカウント作成
			const apiClient = new ApiClient();
			const gymApiClient = new GymApiClient(apiClient);
			const response = await gymApiClient.createGymAccount(gymData);

			setSuccess(`ジムアカウントが正常に作成されました（ジムID: ${response.gymId}）`);

			// 成功後、3秒後にダッシュボードに戻る
			setTimeout(() => {
				router.push("/staff/dashboard");
			}, 3000);
		} catch (err) {
			console.error("ジムアカウント作成エラー:", err);
			setError(err instanceof Error ? err.message : "ジムアカウントの作成に失敗しました");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2">
				<Link href="/staff/dashboard">
					<Button variant="ghost" size="icon">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<h1 className="text-3xl font-bold tracking-tight">ジムアカウント発行</h1>
			</div>

			<div className="max-w-2xl mx-auto">
				<Card>
					<CardHeader>
						<CardTitle>新規ジムアカウント作成</CardTitle>
						<CardDescription>
							ジムとオーナーアカウントを一括で作成します。すべての項目は必須です。
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleSubmit(onSubmit)}>
						<CardContent className="space-y-6">
							{/* エラーメッセージ表示エリア */}
							{error && (
								<div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm mb-4 animate-in fade-in">
									<div className="flex items-center gap-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											role="img"
											aria-label="警告アイコン"
										>
											<title>警告アイコン</title>
											<circle cx="12" cy="12" r="10" />
											<line x1="12" y1="8" x2="12" y2="12" />
											<line x1="12" y1="16" x2="12.01" y2="16" />
										</svg>
										<span className="font-medium">エラー</span>
									</div>
									<p className="mt-1 ml-6">{error}</p>
								</div>
							)}
							{/* 成功メッセージ表示エリア */}
							{success && (
								<div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm mb-4 animate-in fade-in">
									<div className="flex items-center gap-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											role="img"
											aria-label="完了アイコン"
										>
											<title>完了アイコン</title>
											<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
											<polyline points="22 4 12 14.01 9 11.01" />
										</svg>
										<span className="font-medium">成功</span>
									</div>
									<p className="mt-1 ml-6">{success}</p>
								</div>
							)}

							{/* ジム情報セクション */}
							<div className="space-y-4">
								<div className="text-lg font-medium flex items-center gap-2 border-b pb-2">
									<Building className="h-5 w-5" />
									<span>ジム情報</span>
								</div>

								<div className="grid gap-4">
									<div className="grid gap-2">
										<Label htmlFor="name">ジム名</Label>
										<Input
											id="name"
											placeholder="例: キメフィットネスジム"
											{...register("name")}
											aria-invalid={errors.name ? "true" : "false"}
										/>
										{errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
									</div>

									<div className="grid gap-2">
										<Label htmlFor="phoneNumber">電話番号</Label>
										<Input
											id="phoneNumber"
											placeholder="例: 03-1234-5678"
											{...register("phoneNumber")}
											aria-invalid={errors.phoneNumber ? "true" : "false"}
										/>
										{errors.phoneNumber && (
											<p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
										)}
									</div>
								</div>
							</div>

							{/* オーナー情報セクション */}
							<div className="space-y-4">
								<div className="text-lg font-medium flex items-center gap-2 border-b pb-2">
									<User className="h-5 w-5" />
									<span>オーナー情報</span>
								</div>

								<div className="grid gap-4">
									<div className="grid gap-2">
										<Label htmlFor="ownerName">オーナー名</Label>
										<Input
											id="ownerName"
											placeholder="例: 山田 太郎"
											{...register("ownerName")}
											aria-invalid={errors.ownerName ? "true" : "false"}
										/>
										{errors.ownerName && (
											<p className="text-sm text-red-500">{errors.ownerName.message}</p>
										)}
									</div>

									<div className="grid gap-2">
										<Label htmlFor="ownerEmail">メールアドレス</Label>
										<div className="flex items-center gap-2">
											<Mail className="h-4 w-4 text-muted-foreground" />
											<Input
												id="ownerEmail"
												type="email"
												placeholder="例: owner@example.com"
												{...register("ownerEmail")}
												aria-invalid={errors.ownerEmail ? "true" : "false"}
											/>
										</div>
										{errors.ownerEmail && (
											<p className="text-sm text-red-500">{errors.ownerEmail.message}</p>
										)}
									</div>

									<div className="grid gap-2">
										<Label htmlFor="password">パスワード</Label>
										<div className="flex items-center gap-2">
											<Lock className="h-4 w-4 text-muted-foreground" />
											<Input
												id="password"
												type="password"
												placeholder="8文字以上で入力してください"
												{...register("password")}
												aria-invalid={errors.password ? "true" : "false"}
											/>
										</div>
										{errors.password && (
											<p className="text-sm text-red-500">{errors.password.message}</p>
										)}
									</div>
								</div>
							</div>
						</CardContent>
						<CardFooter className="flex justify-between border-t p-6">
							<Button variant="outline" asChild>
								<Link href="/staff/dashboard">キャンセル</Link>
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "処理中..." : "ジムアカウントを作成"}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}

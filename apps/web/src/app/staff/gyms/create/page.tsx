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
import { ArrowLeft, Building, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateGymPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// フォーム送信ハンドラ
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);
		setSuccess(null);

		// フォームデータ取得
		const formData = new FormData(e.currentTarget);
		const gymData: CreateGymAccountRequest = {
			name: formData.get("name") as string,
			phoneNumber: formData.get("phoneNumber") as string,
			ownerEmail: formData.get("ownerEmail") as string,
			ownerName: formData.get("ownerName") as string,
			password: formData.get("password") as string,
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
		} finally {
			setIsSubmitting(false);
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
					<form onSubmit={handleSubmit}>
						<CardContent className="space-y-6">
							{/* エラーメッセージ表示エリア */}
							{error && (
								<div className="p-3 rounded-md bg-red-50 text-red-800 text-sm">{error}</div>
							)}
							{/* 成功メッセージ表示エリア */}
							{success && (
								<div className="p-3 rounded-md bg-green-50 text-green-800 text-sm">{success}</div>
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
										<Input id="name" name="name" placeholder="例: キメフィットネスジム" required />
									</div>

									<div className="grid gap-2">
										<Label htmlFor="phoneNumber">電話番号</Label>
										<Input
											id="phoneNumber"
											name="phoneNumber"
											placeholder="例: 03-1234-5678"
											required
										/>
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
										<Input id="ownerName" name="ownerName" placeholder="例: 山田 太郎" required />
									</div>

									<div className="grid gap-2">
										<Label htmlFor="ownerEmail">メールアドレス</Label>
										<div className="flex items-center gap-2">
											<Mail className="h-4 w-4 text-muted-foreground" />
											<Input
												id="ownerEmail"
												name="ownerEmail"
												type="email"
												placeholder="例: owner@example.com"
												required
											/>
										</div>
									</div>

									<div className="grid gap-2">
										<Label htmlFor="password">パスワード</Label>
										<div className="flex items-center gap-2">
											<Lock className="h-4 w-4 text-muted-foreground" />
											<Input
												id="password"
												name="password"
												type="password"
												placeholder="8文字以上で入力してください"
												required
												minLength={8}
											/>
										</div>
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

"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useGymAuth } from "@/hooks/use-gym-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

/**
 * ログインフォームのバリデーションスキーマ
 */
const loginSchema = z.object({
	email: z
		.string()
		.email("有効なメールアドレスを入力してください")
		.min(1, "メールアドレスは必須です"),
	password: z
		.string()
		.min(8, "パスワードは8文字以上である必要があります")
		.max(100, "パスワードは100文字以内で入力してください"),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * ジムログインページ
 */
export default function GymSignInPage() {
	const { login, isLoading, error, clearError, redirectIfAuthenticated } = useGymAuth();
	const [showPassword, setShowPassword] = useState(false);

	// フォーム設定
	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	// 既にログイン済みの場合はダッシュボードにリダイレクト
	useEffect(() => {
		redirectIfAuthenticated();
	}, [redirectIfAuthenticated]);

	// ローディング中の場合は何も表示しない
	if (isLoading) {
		return (
			<div className="container flex items-center justify-center min-h-screen py-4 px-4">
				<Card className="w-full max-w-md mx-auto">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-bold">読み込み中...</CardTitle>
					</CardHeader>
				</Card>
			</div>
		);
	}

	// エラーメッセージが変更されたときにフォームエラーをクリア
	useEffect(() => {
		if (error) {
			const timer = setTimeout(() => {
				clearError();
			}, 5000);
			return () => clearTimeout(timer);
		}
		return undefined;
	}, [error, clearError]);

	/**
	 * フォーム送信処理
	 */
	const onSubmit = async (data: LoginFormData) => {
		clearError();
		await login(data);
	};

	/**
	 * パスワード表示/非表示の切り替え
	 */
	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<div className="container flex items-center justify-center min-h-screen py-4 px-4">
			<Card className="w-full max-w-md mx-auto">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl font-bold">ジムログイン</CardTitle>
					<CardDescription>
						メールアドレスとパスワードを入力してログインしてください
					</CardDescription>
				</CardHeader>

				{error && (
					<div className="px-6">
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					</div>
				)}

				<CardContent className="p-6">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>メールアドレス</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="mail@example.com"
												autoComplete="email"
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>パスワード</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="パスワードを入力"
													autoComplete="current-password"
													disabled={isLoading}
													className="pr-10"
													{...field}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
													onClick={togglePasswordVisibility}
													disabled={isLoading}
													aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
												>
													{showPassword ? (
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

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "ログイン中..." : "ログイン"}
							</Button>
						</form>
					</Form>
				</CardContent>

				<CardFooter className="flex flex-col space-y-4 p-6 pt-0">
					<Separator className="my-2" />
					<p className="text-xs text-center text-muted-foreground">
						ログインすることで、当サービスの
						<a href="/terms" className="underline mx-1">
							利用規約
						</a>
						と
						<a href="/privacy" className="underline mx-1">
							プライバシーポリシー
						</a>
						に同意したことになります。
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}

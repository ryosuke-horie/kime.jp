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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function SignInContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/staff/dashboard";
	const error = searchParams.get("error");

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// メール/パスワードでサインイン
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const result = await signIn("credentials", {
				redirect: false,
				email,
				password,
				callbackUrl,
			});

			if (result?.error) {
				console.error("ログインエラー:", result.error);
				setIsLoading(false);
			} else if (result?.url) {
				router.push(result.url);
			}
		} catch (error) {
			console.error("ログイン中にエラーが発生しました:", error);
			setIsLoading(false);
		}
	};

	// Google認証でサインイン
	const handleGoogleSignIn = () => {
		setIsLoading(true);
		signIn("google", { callbackUrl });
	};

	// LINE認証でサインイン
	const handleLineSignIn = () => {
		setIsLoading(true);
		signIn("line", { callbackUrl });
	};

	return (
		<div className="container flex items-center justify-center min-h-screen py-12">
			<Card className="w-full max-w-md mx-auto">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl font-bold">管理者ログイン</CardTitle>
					<CardDescription>
						ジム管理システムにログインするには、以下のいずれかの方法を選択してください
					</CardDescription>
				</CardHeader>

				{error && (
					<div className="px-6">
						<Alert variant="destructive">
							<AlertDescription>
								{error === "CredentialsSignin"
									? "メールアドレスまたはパスワードが正しくありません"
									: "ログイン中にエラーが発生しました"}
							</AlertDescription>
						</Alert>
					</div>
				)}

				<CardContent className="p-6">
					<Tabs defaultValue="email" className="w-full">
						<TabsList className="grid w-full grid-cols-3 mb-4">
							<TabsTrigger value="email">メール</TabsTrigger>
							<TabsTrigger value="google">Google</TabsTrigger>
							<TabsTrigger value="line">LINE</TabsTrigger>
						</TabsList>

						<TabsContent value="email">
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="email">メールアドレス</Label>
									<Input
										id="email"
										type="email"
										placeholder="mail@example.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="password">パスワード</Label>
									<Input
										id="password"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
									/>
								</div>
								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? "ログイン中..." : "ログイン"}
								</Button>
							</form>
						</TabsContent>

						<TabsContent value="google">
							<div className="space-y-4 text-center">
								<p className="text-sm text-muted-foreground">
									Googleアカウントを使用してログインします
								</p>
								<Button
									variant="outline"
									onClick={handleGoogleSignIn}
									disabled={isLoading}
									className="w-full"
								>
									<svg
										className="w-5 h-5 mr-2"
										viewBox="0 0 24 24"
										aria-labelledby="google-icon-title"
										role="img"
									>
										<title id="google-icon-title">Googleロゴ</title>
										<path
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
											fill="#4285F4"
										/>
										<path
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
											fill="#34A853"
										/>
										<path
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
											fill="#FBBC05"
										/>
										<path
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
											fill="#EA4335"
										/>
									</svg>
									Googleでログイン
								</Button>
							</div>
						</TabsContent>

						<TabsContent value="line">
							<div className="space-y-4 text-center">
								<p className="text-sm text-muted-foreground">
									LINEアカウントを使用してログインします
								</p>
								<Button
									variant="outline"
									onClick={handleLineSignIn}
									disabled={isLoading}
									className="w-full bg-[#06c755] text-white hover:bg-[#06c755]/90"
								>
									<svg
										className="w-5 h-5 mr-2"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-labelledby="line-icon-title"
										role="img"
									>
										<title id="line-icon-title">LINEロゴ</title>
										<path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.062-.022.131-.03.194-.03.195 0 .375.099.495.25l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
									</svg>
									LINEでログイン
								</Button>
							</div>
						</TabsContent>
					</Tabs>
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

export default function SignIn() {
	return (
		<Suspense
			fallback={
				<div className="container flex items-center justify-center min-h-screen">
					<Card className="w-full max-w-md mx-auto">
						<CardHeader className="space-y-1 text-center">
							<CardTitle className="text-2xl font-bold">読み込み中...</CardTitle>
						</CardHeader>
					</Card>
				</div>
			}
		>
			<SignInContent />
		</Suspense>
	);
}

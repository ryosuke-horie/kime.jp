"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthError() {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");

	// エラーメッセージのマッピング
	const errorMessages: Record<string, string> = {
		Configuration: "認証システムの設定に問題があります",
		AccessDenied: "ログインが拒否されました",
		Verification: "認証リンクが無効または期限切れです",
		Default: "認証中にエラーが発生しました",
		OAuthSignin: "OAuth認証の開始中にエラーが発生しました",
		OAuthCallback: "OAuth認証コールバック中にエラーが発生しました",
		OAuthCreateAccount: "OAuth認証でアカウントを作成できませんでした",
		EmailCreateAccount: "メールアドレスでアカウントを作成できませんでした",
		Callback: "認証コールバック中にエラーが発生しました",
		OAuthAccountNotLinked:
			"このメールアドレスは別の認証方法に関連付けられています",
		EmailSignin: "メール送信中にエラーが発生しました",
		CredentialsSignin: "ログイン情報が正しくありません",
		SessionRequired: "このページにアクセスするにはログインが必要です",
	};

	const errorMessage =
		error && error in errorMessages
			? errorMessages[error]
			: errorMessages.Default;

	return (
		<div className="container flex items-center justify-center min-h-screen py-12">
			<Card className="w-full max-w-md mx-auto">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl font-bold">認証エラー</CardTitle>
					<CardDescription>ログイン処理中に問題が発生しました</CardDescription>
				</CardHeader>

				<CardContent className="flex flex-col items-center p-6">
					<div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/20 mb-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-destructive"
							aria-labelledby="error-icon-title"
							role="img"
						>
							<title id="error-icon-title">エラーアイコン</title>
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					</div>
					<p className="mb-6 text-center font-medium">{errorMessage}</p>
					<p className="text-sm text-center text-muted-foreground">
						エラーコード: {error || "unknown"}
					</p>
				</CardContent>

				<CardFooter className="flex justify-center p-6 pt-0">
					<Button asChild>
						<Link href="/auth/signin">ログインページに戻る</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

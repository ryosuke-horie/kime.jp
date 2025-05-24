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
import { AlertTriangleIcon, HomeIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * エラー情報マッピング
 */
const errorMessages: Record<string, { title: string; description: string }> = {
	Configuration: {
		title: "設定エラー",
		description: "認証設定に問題があります。管理者にお問い合わせください。",
	},
	AccessDenied: {
		title: "アクセス拒否",
		description: "このアカウントではアクセスできません。権限を確認してください。",
	},
	Verification: {
		title: "認証エラー",
		description: "認証に失敗しました。再度ログインをお試しください。",
	},
	Default: {
		title: "認証エラー",
		description: "認証中にエラーが発生しました。しばらく時間をおいてから再度お試しください。",
	},
};

/**
 * エラーページコンテンツ
 */
function ErrorContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const error = searchParams.get("error") || "Default";

	const errorInfo = errorMessages[error] ??
		errorMessages.Default ?? {
			title: "認証エラー",
			description: "認証中にエラーが発生しました。しばらく時間をおいてから再度お試しください。",
		};

	/**
	 * ページリロード
	 */
	const handleRetry = () => {
		router.refresh();
	};

	/**
	 * ログインページに戻る
	 */
	const handleBackToLogin = () => {
		router.push("/gym/auth/signin");
	};

	return (
		<div className="container flex items-center justify-center min-h-screen py-4 px-4">
			<Card className="w-full max-w-md mx-auto">
				<CardHeader className="space-y-1 text-center">
					<div className="flex justify-center mb-4">
						<AlertTriangleIcon className="h-16 w-16 text-destructive" />
					</div>
					<CardTitle className="text-2xl font-bold text-destructive">{errorInfo.title}</CardTitle>
					<CardDescription>{errorInfo.description}</CardDescription>
				</CardHeader>

				<CardContent className="p-6">
					<Alert variant="destructive">
						<AlertTriangleIcon className="h-4 w-4" />
						<AlertDescription>
							問題が解決しない場合は、システム管理者にお問い合わせください。
						</AlertDescription>
					</Alert>
				</CardContent>

				<CardFooter className="flex flex-col space-y-3 p-6 pt-0">
					<Button onClick={handleRetry} className="w-full" variant="outline">
						<RefreshCwIcon className="h-4 w-4 mr-2" />
						再試行
					</Button>

					<Button onClick={handleBackToLogin} className="w-full">
						<HomeIcon className="h-4 w-4 mr-2" />
						ログインページに戻る
					</Button>

					<div className="text-center">
						<Link
							href="/"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							トップページに戻る
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}

/**
 * ジム認証エラーページ
 */
export default function GymAuthErrorPage() {
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
			<ErrorContent />
		</Suspense>
	);
}

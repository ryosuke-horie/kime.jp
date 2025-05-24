"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGymAuth } from "@/hooks/use-gym-auth";
import { LogOutIcon, UserIcon } from "lucide-react";
import { useEffect } from "react";

/**
 * ジムダッシュボードページ（暫定版）
 */
export default function GymDashboardPage() {
	const { user, isAuthenticated, isLoading, logout, requireAuth } = useGymAuth();

	// 認証チェック
	useEffect(() => {
		requireAuth();
	}, [requireAuth]);

	// ローディング中の表示
	if (isLoading) {
		return (
			<div className="container flex items-center justify-center min-h-screen">
				<Card className="w-full max-w-md mx-auto">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-bold">読み込み中...</CardTitle>
					</CardHeader>
				</Card>
			</div>
		);
	}

	// 未認証の場合は空の表示（requireAuthによってリダイレクトされる）
	if (!isAuthenticated || !user) {
		return null;
	}

	/**
	 * ログアウト処理
	 */
	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error("ログアウトエラー:", error);
		}
	};

	return (
		<div className="container max-w-4xl mx-auto py-8 px-4">
			{/* ヘッダー */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-bold">ダッシュボード</h1>
					<p className="text-muted-foreground">ジム管理システム</p>
				</div>
				<Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
					<LogOutIcon className="h-4 w-4" />
					ログアウト
				</Button>
			</div>

			{/* ユーザー情報カード */}
			<div className="grid gap-6 mb-8">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserIcon className="h-5 w-5" />
							ユーザー情報
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<p className="text-sm font-medium text-muted-foreground">名前</p>
								<p className="text-lg">{user.name}</p>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">メールアドレス</p>
								<p className="text-lg">{user.email}</p>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">ジムID</p>
								<p className="text-lg font-mono">{user.gymId}</p>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">権限</p>
								<p className="text-lg">{user.role === "owner" ? "オーナー" : "スタッフ"}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Separator className="mb-8" />

			{/* メニューカード（暫定版） */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>メンバー管理</CardTitle>
						<CardDescription>ジムメンバーの管理を行います</CardDescription>
					</CardHeader>
					<CardContent>
						<Button variant="outline" className="w-full" disabled>
							準備中
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>タイムテーブル</CardTitle>
						<CardDescription>クラススケジュールの管理を行います</CardDescription>
					</CardHeader>
					<CardContent>
						<Button variant="outline" className="w-full" disabled>
							準備中
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>設定</CardTitle>
						<CardDescription>ジムの設定を変更します</CardDescription>
					</CardHeader>
					<CardContent>
						<Button variant="outline" className="w-full" disabled>
							準備中
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>分析</CardTitle>
						<CardDescription>利用状況やデータの分析を確認します</CardDescription>
					</CardHeader>
					<CardContent>
						<Button variant="outline" className="w-full" disabled>
							準備中
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>お知らせ</CardTitle>
						<CardDescription>メンバーへのお知らせを管理します</CardDescription>
					</CardHeader>
					<CardContent>
						<Button variant="outline" className="w-full" disabled>
							準備中
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>サポート</CardTitle>
						<CardDescription>ヘルプやサポートを利用します</CardDescription>
					</CardHeader>
					<CardContent>
						<Button variant="outline" className="w-full" disabled>
							準備中
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* フッター */}
			<div className="mt-12 text-center text-sm text-muted-foreground">
				<p>© 2024 Kime.jp - ジム管理システム</p>
			</div>
		</div>
	);
}

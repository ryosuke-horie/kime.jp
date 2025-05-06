"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChart3, CalendarDays, Home, LogOut, Settings, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { type PropsWithChildren, useEffect } from "react";

export default function StaffLayout({ children }: PropsWithChildren) {
	// セッション状態を取得
	const { data: session, status } = useSession();

	// 認証チェック
	// 注意: クライアントサイドでのリダイレクトは、コンポーネントのマウント・アンマウントの
	// タイミングや状態変化によって予期しないタイミングで実行される可能性があります。
	// 理想的には、この認証ロジックをミドルウェアとしてサーバーサイドに移行することを検討すべきです。
	// middleware.tsでNextAuth対応のミドルウェアを実装することで、より信頼性の高い認証フローを実現できます。
	useEffect(() => {
		if (status === "unauthenticated") {
			// 未認証状態が確定した場合のみリダイレクト
			redirect("/auth/signin?callbackUrl=/staff/dashboard");
		}
	}, [status]);

	// 認証中は読み込み中画面を表示
	if (status === "loading") {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen">
			{/* サイドバー */}
			<div className="w-64 bg-card border-r">
				<div className="p-6">
					<h1 className="text-xl font-bold">キメ管理システム</h1>
					<div className="mt-2 text-sm text-muted-foreground">
						{session?.user?.name ? `${session.user.name}` : "管理者"}
					</div>
				</div>
				<Separator />
				<nav className="p-4 space-y-2">
					<Link href="/staff/dashboard" passHref>
						<Button variant="ghost" className="w-full justify-start">
							<Home className="mr-2 h-4 w-4" /> ダッシュボード
						</Button>
					</Link>
					<Link href="/staff/timetable" passHref>
						<Button variant="ghost" className="w-full justify-start">
							<CalendarDays className="mr-2 h-4 w-4" /> タイムテーブル
						</Button>
					</Link>
					<Link href="/staff/members" passHref>
						<Button variant="ghost" className="w-full justify-start">
							<Users className="mr-2 h-4 w-4" /> 会員管理
						</Button>
					</Link>
					<Link href="/staff/analytics" passHref>
						<Button variant="ghost" className="w-full justify-start">
							<BarChart3 className="mr-2 h-4 w-4" /> 統計分析
						</Button>
					</Link>
					<Link href="/staff/settings" passHref>
						<Button variant="ghost" className="w-full justify-start">
							<Settings className="mr-2 h-4 w-4" /> 設定
						</Button>
					</Link>
				</nav>
				<div className="absolute bottom-4 left-4 right-4">
					<Link href="/auth/signout" passHref>
						<Button variant="outline" className="w-full">
							<LogOut className="mr-2 h-4 w-4" /> ログアウト
						</Button>
					</Link>
				</div>
			</div>

			{/* メインコンテンツ */}
			<div className="flex-1 overflow-auto">
				<header className="bg-background border-b h-14 flex items-center px-6">
					<div className="text-lg font-medium">管理画面</div>
				</header>
				<main className="p-6">{children}</main>
			</div>
		</div>
	);
}

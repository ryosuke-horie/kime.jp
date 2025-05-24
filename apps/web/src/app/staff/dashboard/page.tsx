"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, CalendarDays, Clipboard, Clock, Users } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Dashboard() {
	const { data: session } = useSession();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
				<p className="text-muted-foreground mt-2">
					ジム管理システムへようこそ、{session?.user?.name || "管理者"}さん
				</p>
			</div>

			{/* ダッシュボードカード */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">本日の予約</CardTitle>
						<CalendarCheck className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">12</div>
						<p className="text-xs text-muted-foreground">前日比 +2.5%</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">総会員数</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">54</div>
						<p className="text-xs text-muted-foreground">先月比 +12.3%</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">次回クラス</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">15:00</div>
						<p className="text-xs text-muted-foreground">総合格闘技（予約: 6/8）</p>
					</CardContent>
				</Card>
			</div>

			{/* クイックアクセスボタン */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Button className="flex flex-col items-center justify-center h-24 space-y-2">
					<CalendarDays className="h-6 w-6" />
					<span>予約一覧</span>
				</Button>
				<Button className="flex flex-col items-center justify-center h-24 space-y-2">
					<CalendarDays className="h-6 w-6" />
					<span>タイムテーブル管理</span>
				</Button>
				<Button className="flex flex-col items-center justify-center h-24 space-y-2">
					<Users className="h-6 w-6" />
					<span>会員管理</span>
				</Button>
				<Button className="flex flex-col items-center justify-center h-24 space-y-2">
					<Clipboard className="h-6 w-6" />
					<span>レポート</span>
				</Button>
			</div>

			{/* 最近の予約（仮データ） */}
			<div>
				<Card>
					<CardHeader>
						<CardTitle>最近の予約</CardTitle>
						<CardDescription>本日と明日の予約一覧</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="space-y-3">
							<li className="flex justify-between items-center border-b pb-2">
								<div>
									<div className="font-medium">山田 太郎</div>
									<div className="text-sm text-muted-foreground">ボクシング入門</div>
								</div>
								<div className="text-right">
									<div className="text-sm">今日 10:00-11:00</div>
									<div className="text-xs text-muted-foreground">予約済み</div>
								</div>
							</li>
							<li className="flex justify-between items-center border-b pb-2">
								<div>
									<div className="font-medium">鈴木 花子</div>
									<div className="text-sm text-muted-foreground">キックボクシング</div>
								</div>
								<div className="text-right">
									<div className="text-sm">今日 12:00-13:00</div>
									<div className="text-xs text-muted-foreground">予約済み</div>
								</div>
							</li>
							<li className="flex justify-between items-center border-b pb-2">
								<div>
									<div className="font-medium">佐藤 健</div>
									<div className="text-sm text-muted-foreground">総合格闘技</div>
								</div>
								<div className="text-right">
									<div className="text-sm">今日 15:00-16:30</div>
									<div className="text-xs text-muted-foreground">予約済み</div>
								</div>
							</li>
							<li className="flex justify-between items-center">
								<div>
									<div className="font-medium">田中 美咲</div>
									<div className="text-sm text-muted-foreground">柔術基礎</div>
								</div>
								<div className="text-right">
									<div className="text-sm">明日 18:00-19:30</div>
									<div className="text-xs text-muted-foreground">予約済み</div>
								</div>
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

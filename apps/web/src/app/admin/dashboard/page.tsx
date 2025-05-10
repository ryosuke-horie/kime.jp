"use client";

import { DashboardLayout } from "@/components/admin/dashboard-layout";
import { StatsCard } from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
	// 仮のデータ（実際の実装では適切なAPIからデータを取得する）
	const statsData = [
		{
			id: "total-gyms",
			title: "登録ジム数",
			value: "24",
			description: "前月比 +12%",
			trend: { value: 12, isPositive: true },
		},
		{
			id: "active-users",
			title: "アクティブユーザー",
			value: "573",
			description: "直近30日間",
			trend: { value: 5, isPositive: true },
		},
		{
			id: "total-reservations",
			title: "予約総数",
			value: "1,284",
			description: "当月",
			trend: { value: 8, isPositive: true },
		},
		{
			id: "system-uptime",
			title: "システム稼働率",
			value: "99.98%",
			description: "直近30日間",
			trend: { value: 0.01, isPositive: true },
		},
	];

	// 仮の通知データ
	const notifications = [
		{
			id: "notif-1",
			title: "新規ジム登録",
			content: "フィットネスクラブXYZが新しく登録されました",
			time: "5分前",
		},
		{
			id: "notif-2",
			title: "システムアラート",
			content: "バックアップが正常に完了しました",
			time: "1時間前",
		},
		{
			id: "notif-3",
			title: "メンテナンス情報",
			content: "明日の深夜2時からシステムメンテナンスを実施します",
			time: "3時間前",
		},
	];

	return (
		<DashboardLayout>
			<div className="flex flex-col gap-6">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">システム管理ダッシュボード</h1>
					<p className="text-muted-foreground">システム全体のKPIと稼働状況を確認できます</p>
				</div>

				{/* KPI統計カード */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{statsData.map((stat) => (
						<StatsCard key={stat.id} {...stat} />
					))}
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					{/* 最近の通知 */}
					<Card className="shadow-sm">
						<CardHeader>
							<CardTitle>最近の通知</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{notifications.map((notification) => (
									<div
										key={notification.id}
										className="flex flex-col space-y-1 border-b pb-3 last:border-0"
									>
										<div className="flex justify-between">
											<span className="font-medium">{notification.title}</span>
											<span className="text-xs text-muted-foreground">{notification.time}</span>
										</div>
										<span className="text-sm">{notification.content}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* クイックアクション */}
					<Card className="shadow-sm">
						<CardHeader>
							<CardTitle>クイックアクセス</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4">
								<div className="flex flex-col items-center justify-center rounded-md border border-dashed p-4 text-center">
									<span className="mb-2 font-medium">ジム管理</span>
									<a href="/admin/gyms" className="text-sm text-blue-600 hover:underline">
										ジム一覧を表示
									</a>
								</div>
								<div className="flex flex-col items-center justify-center rounded-md border border-dashed p-4 text-center">
									<span className="mb-2 font-medium">権限設定</span>
									<a href="/admin/permissions" className="text-sm text-blue-600 hover:underline">
										権限を管理
									</a>
								</div>
								<div className="flex flex-col items-center justify-center rounded-md border border-dashed p-4 text-center">
									<span className="mb-2 font-medium">システム状態</span>
									<a href="/admin/system" className="text-sm text-blue-600 hover:underline">
										状態を確認
									</a>
								</div>
								<div className="flex flex-col items-center justify-center rounded-md border border-dashed p-4 text-center">
									<span className="mb-2 font-medium">レポート</span>
									<a href="/admin/reports" className="text-sm text-blue-600 hover:underline">
										レポートを表示
									</a>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</DashboardLayout>
	);
}

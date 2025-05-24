"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar, DollarSign, Target, TrendingUp, Users } from "lucide-react";

export default function AnalyticsPage() {
	const monthlyStats = [
		{ id: "dec", month: "12月", members: 52, revenue: 1560000, classes: 120, attendance: 89 },
		{ id: "jan", month: "1月", members: 54, revenue: 1620000, classes: 128, attendance: 92 },
	];

	const popularClasses = [
		{ id: "boxing", name: "ボクシング入門", sessions: 24, attendanceRate: 95, revenue: 360000 },
		{
			id: "kickboxing",
			name: "キックボクシング",
			sessions: 20,
			attendanceRate: 88,
			revenue: 320000,
		},
		{ id: "mma", name: "総合格闘技", sessions: 16, attendanceRate: 92, revenue: 480000 },
		{ id: "jujitsu", name: "柔術基礎", sessions: 18, attendanceRate: 85, revenue: 270000 },
	];

	const membershipTypes = [
		{ id: "premium", type: "プレミアム", count: 18, percentage: 33, revenue: 900000 },
		{ id: "standard", type: "スタンダード", count: 24, percentage: 44, revenue: 600000 },
		{ id: "basic", type: "ベーシック", count: 12, percentage: 23, revenue: 120000 },
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">統計分析</h1>
					<p className="text-muted-foreground mt-2">ジム運営の分析とレポート</p>
				</div>
				<div className="flex items-center space-x-2">
					<Select defaultValue="current-month">
						<SelectTrigger className="w-40">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="current-month">今月</SelectItem>
							<SelectItem value="last-month">先月</SelectItem>
							<SelectItem value="last-3-months">過去3ヶ月</SelectItem>
							<SelectItem value="last-6-months">過去6ヶ月</SelectItem>
						</SelectContent>
					</Select>
					<Button>レポート出力</Button>
				</div>
			</div>

			{/* 概要統計 */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">月間売上</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">¥1,620,000</div>
						<p className="text-xs text-muted-foreground flex items-center">
							<TrendingUp className="mr-1 h-3 w-3 text-green-500" />
							前月比 +3.8%
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">アクティブ会員</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">54</div>
						<p className="text-xs text-muted-foreground flex items-center">
							<TrendingUp className="mr-1 h-3 w-3 text-green-500" />
							前月比 +3.7%
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">開催クラス数</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">128</div>
						<p className="text-xs text-muted-foreground flex items-center">
							<TrendingUp className="mr-1 h-3 w-3 text-green-500" />
							前月比 +6.7%
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">平均出席率</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">92%</div>
						<p className="text-xs text-muted-foreground flex items-center">
							<TrendingUp className="mr-1 h-3 w-3 text-green-500" />
							前月比 +3.0%
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="classes" className="space-y-4">
				<TabsList>
					<TabsTrigger value="classes">クラス分析</TabsTrigger>
					<TabsTrigger value="membership">会員分析</TabsTrigger>
					<TabsTrigger value="revenue">売上分析</TabsTrigger>
					<TabsTrigger value="trends">トレンド分析</TabsTrigger>
				</TabsList>

				<TabsContent value="classes" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<BarChart3 className="mr-2 h-5 w-5" />
								人気クラス分析
							</CardTitle>
							<CardDescription>クラス別の参加状況と売上</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{popularClasses.map((classData) => (
									<div
										key={classData.id}
										className="flex items-center justify-between p-4 border rounded-lg"
									>
										<div>
											<div className="font-semibold">{classData.name}</div>
											<div className="text-sm text-muted-foreground">
												開催回数: {classData.sessions}回
											</div>
										</div>
										<div className="flex items-center space-x-4">
											<div className="text-right">
												<div className="text-sm font-medium">
													出席率: {classData.attendanceRate}%
												</div>
												<div className="text-sm text-muted-foreground">
													売上: ¥{classData.revenue.toLocaleString()}
												</div>
											</div>
											<Badge variant={classData.attendanceRate > 90 ? "default" : "secondary"}>
												{classData.attendanceRate > 90 ? "好調" : "普通"}
											</Badge>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="membership" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>会員種別分析</CardTitle>
							<CardDescription>会員種別ごとの分布と売上貢献</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{membershipTypes.map((membership) => (
									<div
										key={membership.id}
										className="flex items-center justify-between p-4 border rounded-lg"
									>
										<div>
											<div className="font-semibold">{membership.type}</div>
											<div className="text-sm text-muted-foreground">
												{membership.count}名 ({membership.percentage}%)
											</div>
										</div>
										<div className="text-right">
											<div className="text-sm font-medium">
												¥{membership.revenue.toLocaleString()}
											</div>
											<div className="text-sm text-muted-foreground">月間売上</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="revenue" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>売上推移</CardTitle>
							<CardDescription>月別売上とKPI推移</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{monthlyStats.map((stat) => (
									<div
										key={stat.id}
										className="flex items-center justify-between p-4 border rounded-lg"
									>
										<div className="font-semibold">{stat.month}</div>
										<div className="grid grid-cols-4 gap-4 text-sm">
											<div>
												<div className="font-medium">¥{stat.revenue.toLocaleString()}</div>
												<div className="text-muted-foreground">売上</div>
											</div>
											<div>
												<div className="font-medium">{stat.members}名</div>
												<div className="text-muted-foreground">会員数</div>
											</div>
											<div>
												<div className="font-medium">{stat.classes}回</div>
												<div className="text-muted-foreground">クラス</div>
											</div>
											<div>
												<div className="font-medium">{stat.attendance}%</div>
												<div className="text-muted-foreground">出席率</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="trends" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>トレンド分析</CardTitle>
							<CardDescription>時間帯別・曜日別の利用傾向</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<h4 className="font-semibold mb-2">人気時間帯</h4>
									<div className="space-y-2">
										<div className="flex justify-between">
											<span>18:00-20:00</span>
											<Badge>最高</Badge>
										</div>
										<div className="flex justify-between">
											<span>10:00-12:00</span>
											<Badge variant="secondary">高</Badge>
										</div>
										<div className="flex justify-between">
											<span>14:00-16:00</span>
											<Badge variant="outline">中</Badge>
										</div>
									</div>
								</div>
								<div>
									<h4 className="font-semibold mb-2">曜日別利用率</h4>
									<div className="space-y-2">
										<div className="flex justify-between">
											<span>土曜日</span>
											<Badge>95%</Badge>
										</div>
										<div className="flex justify-between">
											<span>平日夜</span>
											<Badge variant="secondary">88%</Badge>
										</div>
										<div className="flex justify-between">
											<span>日曜日</span>
											<Badge variant="outline">72%</Badge>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

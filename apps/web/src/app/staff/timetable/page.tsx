"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Edit, Plus, Users } from "lucide-react";

export default function TimetablePage() {
	const timetableData = [
		{
			id: "class-1",
			time: "10:00-11:00",
			title: "ボクシング入門",
			instructor: "山田コーチ",
			capacity: 10,
			reserved: 8,
			status: "開催予定",
		},
		{
			id: "class-2",
			time: "11:30-12:30",
			title: "キックボクシング",
			instructor: "鈴木コーチ",
			capacity: 8,
			reserved: 6,
			status: "開催予定",
		},
		{
			id: "class-3",
			time: "14:00-15:30",
			title: "総合格闘技",
			instructor: "佐藤コーチ",
			capacity: 12,
			reserved: 10,
			status: "開催予定",
		},
		{
			id: "class-4",
			time: "18:00-19:30",
			title: "柔術基礎",
			instructor: "田中コーチ",
			capacity: 8,
			reserved: 7,
			status: "開催予定",
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">タイムテーブル管理</h1>
					<p className="text-muted-foreground mt-2">クラススケジュールの管理・編集</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					新規クラス追加
				</Button>
			</div>

			{/* 今日のスケジュール */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Clock className="mr-2 h-5 w-5" />
						今日のスケジュール
					</CardTitle>
					<CardDescription>本日開催予定のクラス一覧</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{timetableData.map((class_) => (
							<div
								key={class_.id}
								className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
							>
								<div className="flex items-center space-x-4">
									<div className="text-sm font-mono text-muted-foreground w-20">{class_.time}</div>
									<div>
										<div className="font-semibold">{class_.title}</div>
										<div className="text-sm text-muted-foreground">講師: {class_.instructor}</div>
									</div>
								</div>
								<div className="flex items-center space-x-4">
									<div className="flex items-center text-sm">
										<Users className="mr-1 h-4 w-4" />
										{class_.reserved}/{class_.capacity}
									</div>
									<Badge variant="secondary">{class_.status}</Badge>
									<Button variant="outline" size="sm">
										<Edit className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* 週間ビュー */}
			<Card>
				<CardHeader>
					<CardTitle>週間スケジュール</CardTitle>
					<CardDescription>今週のクラススケジュール概要</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-7 gap-2 text-center text-sm">
						{["月", "火", "水", "木", "金", "土", "日"].map((day) => (
							<div key={day} className="p-2 font-semibold border-b">
								{day}
							</div>
						))}
						{["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((dayId) => (
							<div key={dayId} className="p-2 space-y-1">
								<div className="text-xs bg-blue-100 text-blue-800 p-1 rounded">
									10:00 ボクシング
								</div>
								<div className="text-xs bg-green-100 text-green-800 p-1 rounded">18:00 柔術</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

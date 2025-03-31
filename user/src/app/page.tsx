"use client";

import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { CalendarIcon, DumbbellIcon, UserIcon } from "lucide-react";
import Link from "next/link";

// データの型定義
interface User {
	id: number;
	admin_id: number;
	name: string;
	email: string;
	email_verified_at: string | null;
	created_at: string;
	updated_at: string;
}

interface ScheduleItem {
	id: number;
	admin_id: number;
	day_of_week: string;
	start_time: string;
	end_time: string;
	class_name: string;
	created_at: string;
	updated_at: string;
}

interface PracticeHistory {
	id: number;
	user_id: number;
	schedule_id: number | null;
	created_at: string;
	updated_at: string;
	schedule?: ScheduleItem;
}

interface MypageData {
	user: User;
	practice_histories: PracticeHistory[];
	schedules: {
		[key: string]: ScheduleItem[];
	};
}

export default function Component() {
	const { isAuthenticated, loading, error } = useAuth();
	const [mypageData, setMypageData] = useState<MypageData | null>(null);
	const [dataLoading, setDataLoading] = useState<boolean>(true);
	const [dataError, setDataError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			if (!isAuthenticated) {
				setDataLoading(false);
				return;
			}

			try {
				const token = localStorage.getItem("dojo-pass-user-token");
				if (!token) {
					throw new Error("認証できていません。ログインをお試しください");
				}

				const apiUrl = process.env.NEXT_PUBLIC_API_URL;
				const response = await fetch(`${apiUrl}/api/user/mypage`, {
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${token}`,
					},
				});
				if (!response.ok) {
					throw new Error("データ取得に失敗しました。");
				}
				const data: MypageData = await response.json();
				setMypageData(data);
			} catch (err) {
				console.error("データ取得エラー:", err);
				setDataError(
					"データの取得に失敗しました。再度ログインをお試しください",
				);
			} finally {
				setDataLoading(false);
			}
		};

		fetchData();
	}, [isAuthenticated]);

	if (loading || dataLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				読み込み中...
			</div>
		);
	}

	if (error || dataError) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-red-500">{error || dataError}</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4 space-y-6">
			<h1 className="text-3xl font-bold text-center mb-6">マイページ</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* 会員情報カード */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<UserIcon className="mr-2" />
							会員情報
						</CardTitle>
					</CardHeader>
					<CardContent>
						{mypageData && (
							<>
								<p>
									<strong>名前:</strong> {mypageData.user.name}
								</p>
								<p>
									<strong>メールアドレス:</strong> {mypageData.user.email}
								</p>
							</>
						)}
					</CardContent>
				</Card>

				{/* 練習記録カード */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<DumbbellIcon className="mr-2" />
							練習記録
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Link href="/entry" className="w-full block">
							<Button variant="default" size="lg" className="w-full">
								練習記録を行う
							</Button>
						</Link>
						{mypageData && mypageData.practice_histories.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>日付</TableHead>
										<TableHead>レッスン</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{mypageData.practice_histories.map((history) => (
										<TableRow key={history.id}>
											<TableCell>
												{new Date(history.created_at).toLocaleDateString()}
											</TableCell>
											<TableCell>
												{history.schedule
													? `${history.schedule.class_name} (${history.schedule.start_time} - ${history.schedule.end_time})`
													: "レッスン情報なし"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<p>練習記録がありません。</p>
						)}
					</CardContent>
				</Card>
			</div>

			{/* タイムテーブルカード */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<CalendarIcon className="mr-2" />
						タイムテーブル
					</CardTitle>
				</CardHeader>
				<CardContent>
					{mypageData && Object.keys(mypageData.schedules).length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{Object.entries(mypageData.schedules).map(([day, classes]) => (
								<div key={day} className="border p-4 rounded-lg">
									<h3 className="font-bold mb-2">{day}</h3>
									<ul className="list-disc list-inside">
										{classes.map((cls) => (
											<li key={cls.id}>
												{cls.start_time} - {cls.end_time} {cls.class_name}
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					) : (
						<p>スケジュールがありません。</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

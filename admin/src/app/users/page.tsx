"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	CalendarIcon,
	DumbbellIcon,
	HistoryIcon,
	SearchIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// データの型定義
interface Schedule {
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
	schedule: Schedule;
}

interface UserImage {
	id: number;
	image_url: string;
}

interface User {
	id: number;
	name: string;
	admin_id: number;
	email: string;
	phone: string;
	practice_histories: PracticeHistory[];
	total_practice_count: number;
	last_week_practice_count: number;
	average_practice_per_week: number;
	images?: UserImage[];
}

export default function Component() {
	const [users, setUsers] = useState<User[]>([]);
	const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	// 認証チェック
	useEffect(() => {
		const checkAuth = () => {
			const token = localStorage.getItem("admin-dojo-pass-token");

			if (!token) {
				router.push("/login");
				return;
			}
		};

		checkAuth();
	}, [router]);

	// 会員データの取得
	useEffect(() => {
		const fetchData = async () => {
			try {
				const token = localStorage.getItem("admin-dojo-pass-token");
				if (!token) {
					return;
				}

				const apiUrl = process.env.NEXT_PUBLIC_API_URL;

				const response = await fetch(`${apiUrl}/api/admin/histories`, {
					method: "GET",
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${token}`,
					},
				});
				if (!response.ok) {
					throw new Error("データの取得に失敗しました。");
				}
				const data: User[] = await response.json();
				setUsers(data);
				setFilteredUsers(data);
			} catch (error) {
				setError("データの取得に失敗しました。");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	// 検索キーワードが変更されたときのフィルタリング
	useEffect(() => {
		const filtered = users.filter((user) =>
			user.name.toLowerCase().includes(searchTerm.toLowerCase()),
		);
		setFilteredUsers(filtered);
	}, [searchTerm, users]);

	if (loading) return <p>読み込み中...</p>;
	if (error) return <p>{error}</p>;

	return (
		<div className="container mx-auto p-4 space-y-6">
			<h1 className="text-2xl font-bold mb-4">会員練習履歴一覧</h1>

			{/* 検索入力フィールド */}
			<div className="flex items-center mb-6">
				<SearchIcon className="mr-2 h-5 w-5 text-muted-foreground" />
				<Input
					type="text"
					placeholder="名前で検索"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full max-w-sm"
				/>
			</div>

			{/* カードをグリッドで表示 */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
				{filteredUsers.map((user) => (
					<Card key={user.id} className="w-full">
						{/* 会員情報セクション */}
						<CardHeader className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4">
							{/* 画像部分 */}
							<div className="flex-shrink-0 mx-auto md:mx-0">
								{user.images && user.images.length > 0 ? (
									<Image
										src={user.images[0].image_url}
										alt={user.name}
										width={128}
										height={128}
										className="object-cover w-32 h-32"
									/>
								) : (
									<div className="flex items-center justify-center w-32 h-32 bg-gray-200 text-gray-500 text-2xl">
										{user.name.charAt(0)}
									</div>
								)}
							</div>

							{/* 情報部分 */}
							<div className="flex-1 text-center md:text-left">
								<CardTitle className="text-xl">{user.name}</CardTitle>
								<p className="text-sm text-muted-foreground">
									{user.email} | {user.phone}
								</p>
								{/* 練習回数情報を縦に表示 */}
								<div className="flex flex-col space-y-2 mt-2">
									<div className="flex items-center">
										<HistoryIcon className="mr-1 h-4 w-4" />
										<span className="text-sm">
											トータル練習回数: {user.total_practice_count}回
										</span>
									</div>
									<div className="flex items-center">
										<CalendarIcon className="mr-1 h-4 w-4" />
										<span className="text-sm">
											直近1週間の練習回数: {user.last_week_practice_count}回
										</span>
									</div>
									<div className="flex items-center">
										<HistoryIcon className="mr-1 h-4 w-4" />
										<span className="text-sm">
											1週間あたりの平均練習回数:{" "}
											{user.average_practice_per_week}回
										</span>
									</div>
								</div>
							</div>
						</CardHeader>

						{/* 練習記録セクション */}
						<CardContent>
							<div className="flex items-center mb-4">
								<DumbbellIcon className="mr-2" />
								<h2 className="text-lg font-semibold">練習記録</h2>
							</div>
							{user.practice_histories.length > 0 ? (
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>来館日時</TableHead>
												<TableHead>クラス名</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{user.practice_histories.map((history) => (
												<TableRow key={history.id}>
													<TableCell>
														{new Date(history.created_at).toLocaleString()}
													</TableCell>
													<TableCell>
														{history.schedule
															? history.schedule.class_name
															: "クラスなし"}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							) : (
								<p className="text-muted-foreground">
									この会員にはまだ練習履歴がございません。
								</p>
							)}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

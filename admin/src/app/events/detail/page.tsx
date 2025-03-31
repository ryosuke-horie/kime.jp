"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface UserImage {
	id: number;
	image_path: string;
}

interface User {
	id: number;
	name: string;
	user_images: UserImage[];
}

interface Attendance {
	id: number;
	event_id: number;
	user_id: number;
	status: string;
	responded_at: string | null;
	created_at: string;
	updated_at: string;
	user: User;
}

interface EventData {
	id: number;
	admin_id: number;
	title: string;
	event_date: string;
	deadline: string;
	content: string;
	notify_by_email: boolean;
	created_at: string;
	updated_at: string;
	attendances: Attendance[];
}

interface Participant {
	id: number;
	name: string;
	image: string | null;
	status: string;
}

export default function AdminEventDetail() {
	const searchParams = useSearchParams();
	const eventId = searchParams.get("eventId");
	const [filter, setFilter] = useState<string>("all");
	const [eventData, setEventData] = useState<EventData | null>(null);
	const [participants, setParticipants] = useState<Participant[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const { toast } = useToast();

	useEffect(() => {
		const fetchEventData = async () => {
			if (!eventId) return;
			try {
				const token = localStorage.getItem("admin-dojo-pass-token");
				if (!token) {
					throw new Error(
						"認証トークンがありません。再度ログインしてください。",
					);
				}

				const apiUrl = process.env.NEXT_PUBLIC_API_URL;
				const response = await fetch(`${apiUrl}/api/admin/events/${eventId}`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					throw new Error("イベントの取得に失敗しました。");
				}

				const data = (await response.json()) as EventData;

				setEventData(data);

				// 参加者データを処理
				const attendances = data.attendances || [];
				const participantsMap: { [key: number]: Participant } = {};

				attendances.forEach((attendance: Attendance) => {
					const user = attendance.user;
					if (!participantsMap[user.id]) {
						participantsMap[user.id] = {
							id: user.id,
							name: user.name,
							image:
								user.user_images.length > 0
									? user.user_images[0].image_path
									: "/placeholder.svg?height=40&width=40", // プレースホルダー画像
							status: attendance.status,
						};
					}
				});

				const participantsArray: Participant[] = Object.values(participantsMap);
				setParticipants(participantsArray);
			} catch (error) {
				console.error(error);
				toast({
					title: "エラー",
					description:
						error instanceof Error
							? error.message
							: "イベントの取得中にエラーが発生しました。",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchEventData();
	}, [eventId, toast]);

	const filteredParticipants = participants.filter(
		(p) => filter === "all" || p.status === filter,
	);

	// 集計データの計算
	const totalParticipants = participants.length;
	const attendingCount = participants.filter((p) => p.status === "参加").length;
	const notAttendingCount = participants.filter(
		(p) => p.status === "不参加",
	).length;

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!eventData) {
		return <div>イベントのデータが見つかりません。</div>;
	}

	return (
		<div className="container mx-auto px-4 py-10">
			{/* イベント詳細カード */}
			<Card className="mb-8">
				<CardHeader>
					<CardTitle className="text-3xl font-bold">
						{eventData.title}
					</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4">
					<div className="grid sm:grid-cols-2 gap-4">
						<div>
							<h3 className="font-semibold">開催日時</h3>
							<p>{new Date(eventData.event_date).toLocaleString("ja-JP")}</p>
						</div>
						<div>
							<h3 className="font-semibold">締め切り日</h3>
							<p>{new Date(eventData.deadline).toLocaleString("ja-JP")}</p>
						</div>
					</div>
					<div>
						<h3 className="font-semibold">内容</h3>
						<p>{eventData.content}</p>
						{/* メール送信状況の表示 */}
						<p
							className={`mt-2 text-sm ${
								eventData.notify_by_email ? "text-green-800" : "text-red-800"
							}`}
						>
							メール送信: {eventData.notify_by_email ? "送信済み" : "未送信"}
						</p>
					</div>
				</CardContent>
			</Card>

			{/* 回答者一覧カード */}
			<Card>
				<CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
					<div>
						<CardTitle className="mb-2">回答会員一覧</CardTitle>
						{/* サマリー情報 */}
						<div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
							<p className="text-lg">
								<span className="font-semibold">総回答者数:</span>{" "}
								{totalParticipants} 名
							</p>
							<p className="text-green-800">
								<span className="font-semibold">参加:</span> {attendingCount} 名
							</p>
							<p className="text-red-800">
								<span className="font-semibold">不参加:</span>{" "}
								{notAttendingCount} 名
							</p>
						</div>
					</div>
					{/* フィルター */}
					<Select value={filter} onValueChange={setFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="フィルター" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">全て</SelectItem>
							<SelectItem value="参加">参加</SelectItem>
							<SelectItem value="不参加">不参加</SelectItem>
						</SelectContent>
					</Select>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{filteredParticipants.map((participant) => (
							<Card
								key={participant.id}
								className="p-4 flex flex-col items-center"
							>
								{/* Image コンポーネントに置き換え */}
								<div className="mb-2 w-20 h-20 relative">
									{participant.image ? (
										<Image
											src={participant.image}
											alt={participant.name}
											fill
											className="object-cover rounded"
										/>
									) : (
										<div className="bg-gray-200 flex items-center justify-center w-full h-full">
											<span className="text-xl font-semibold">
												{participant.name.charAt(0)}
											</span>
										</div>
									)}
								</div>
								<h3 className="text-lg font-semibold">{participant.name}</h3>
								<span
									className={`mt-1 px-2 py-1 text-sm rounded ${
										participant.status === "参加"
											? "bg-green-100 text-green-800"
											: "bg-red-100 text-red-800"
									}`}
								>
									{participant.status}
								</span>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{/* トースト通知を表示するためのToasterコンポーネント */}
			<Toaster />
		</div>
	);
}

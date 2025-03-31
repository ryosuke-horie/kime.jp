"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth";
import { Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";

// データの型定義
interface Attendance {
	id: number;
	event_id: number;
	status: "参加" | "不参加";
	responded_at: string;
	created_at: string;
	updated_at: string;
}

interface Event {
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

export default function MemberEventList() {
	const { isAuthenticated, loading, error } = useAuth();
	const [events, setEvents] = useState<Event[] | null>(null);
	const [dataLoading, setDataLoading] = useState<boolean>(true);
	const [dataError, setDataError] = useState<string | null>(null);
	const [updatingEventIds, setUpdatingEventIds] = useState<Set<number>>(
		new Set(),
	);

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
				const response = await fetch(`${apiUrl}/api/user/events`, {
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${token}`,
					},
				});
				if (!response.ok) {
					throw new Error("データ取得に失敗しました。");
				}
				const data: { events: Event[] } = await response.json();
				setEvents(data.events);
			} catch (err) {
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

	const validEvents = events
		? events.filter((event) => new Date(event.deadline) > new Date())
		: [];

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "参加":
				return <Badge className="bg-green-500">参加</Badge>;
			case "不参加":
				return <Badge className="bg-red-500">不参加</Badge>;
			default:
				return <Badge className="bg-yellow-500">未回答</Badge>;
		}
	};

	const handleAttendance = async (
		eventId: number,
		status: "参加" | "不参加",
	) => {
		if (updatingEventIds.has(eventId)) {
			return;
		}

		setUpdatingEventIds((prev) => new Set(prev).add(eventId));

		try {
			const token = localStorage.getItem("dojo-pass-user-token");
			if (!token) {
				throw new Error("認証できていません。ログインをお試しください");
			}

			const apiUrl = process.env.NEXT_PUBLIC_API_URL;
			const response = await fetch(
				`${apiUrl}/api/user/events/${eventId}/attendance`,
				{
					method: "POST",
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: `{\"status\":\"${status}\"}`,
				},
			);

			if (!response.ok) {
				throw new Error("参加情報の送信に失敗しました。");
			}

			// 成功したら画面をリロード
			window.location.reload();
		} catch (err) {
			alert("参加情報の送信に失敗しました。");
		} finally {
			setUpdatingEventIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(eventId);
				return newSet;
			});
		}
	};

	return (
		<div className="container mx-auto px-4 py-10">
			<h1 className="text-3xl font-bold mb-6">イベント一覧</h1>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{validEvents.map((event) => {
					const status =
						event.attendances.length > 0
							? event.attendances[0].status
							: "未回答";
					const isUpdating = updatingEventIds.has(event.id);

					return (
						<Card key={event.id} className="flex flex-col">
							<CardHeader>
								<CardTitle className="text-xl">{event.title}</CardTitle>
							</CardHeader>
							<CardContent className="flex-grow">
								<div className="space-y-2 mb-4">
									<div className="flex items-center">
										<Calendar className="mr-2 h-4 w-4" />
										<span>
											{new Date(event.event_date).toLocaleString("ja-JP", {
												dateStyle: "long",
												timeStyle: "short",
											})}
										</span>
									</div>
									<div className="flex items-center">
										<Clock className="mr-2 h-4 w-4" />
										<span>
											締切:{" "}
											{new Date(event.deadline).toLocaleString("ja-JP", {
												dateStyle: "long",
												timeStyle: "short",
											})}
										</span>
									</div>
								</div>
								{/* イベントの詳細を表示 */}
								<div className="mb-4">
									<p>{event.content}</p>
								</div>
								{/* ユーザー自身の回答状況 */}
								<div className="flex items-center justify-between">
									{getStatusBadge(status)}
									<div className="space-x-2">
										<Button
											variant="outline"
											onClick={() => handleAttendance(event.id, "参加")}
											disabled={status === "参加" || isUpdating}
										>
											{isUpdating ? "更新中..." : "参加"}
										</Button>
										<Button
											variant="outline"
											onClick={() => handleAttendance(event.id, "不参加")}
											disabled={status === "不参加" || isUpdating}
										>
											{isUpdating ? "更新中..." : "不参加"}
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
			{validEvents.length === 0 && (
				<p className="text-center text-gray-500 mt-10">
					現在、参加可能なイベントはありません。
				</p>
			)}
		</div>
	);
}

"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Edit, Eye, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
}

interface MappedEvent {
	id: number;
	title: string;
	date: string;
	deadline: string;
	content: string;
	isPast: boolean;
}

export default function AdminEventList() {
	const [events, setEvents] = useState<MappedEvent[]>([]);
	const { toast } = useToast();
	const router = useRouter();

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const token = localStorage.getItem("admin-dojo-pass-token");
				if (!token) {
					throw new Error(
						"認証トークンがありません。再度ログインしてください。",
					);
				}

				const apiUrl = process.env.NEXT_PUBLIC_API_URL;
				const response = await fetch(`${apiUrl}/api/admin/events`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						Authorization: `Bearer ${token}`,
					},
				});

				const data: Event[] = await response.json();

				if (!response.ok) {
					throw new Error("イベントの取得に失敗しました。");
				}

				// データをマッピングしてisPastプロパティを追加
				const mappedEvents: MappedEvent[] = data.map((event) => {
					const eventDate = new Date(event.event_date);
					const isPast = eventDate < new Date();

					return {
						id: event.id,
						title: event.title,
						date: event.event_date,
						deadline: event.deadline,
						content: event.content,
						isPast: isPast,
					};
				});

				setEvents(mappedEvents);
			} catch (error: any) {
				toast({
					title: "エラー",
					description: "イベントの取得中にエラーが発生しました。",
					variant: "destructive",
				});
			}
		};

		fetchEvents();
	}, []);

	const handleDelete = async (id: number) => {
		try {
			const confirmDelete = confirm("このイベントを削除してもよろしいですか？");
			if (!confirmDelete) return;

			const token = localStorage.getItem("admin-dojo-pass-token");
			if (!token) {
				throw new Error("認証トークンがありません。再度ログインしてください。");
			}

			const apiUrl = process.env.NEXT_PUBLIC_API_URL;
			const response = await fetch(`${apiUrl}/api/admin/events/${id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error("イベントの削除に失敗しました。");
			}

			setEvents(events.filter((event) => event.id !== id));

			toast({
				title: "削除成功",
				description: "イベントが削除されました。",
			});
		} catch (error: any) {
			toast({
				title: "エラー",
				description: "イベントの削除中にエラーが発生しました。",
				variant: "destructive",
			});
		}
	};

	const EventTable = ({ isPast }: { isPast: boolean }) => {
		const router = useRouter();

		return (
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>タイトル</TableHead>
							<TableHead>開催日時</TableHead>
							<TableHead>締め切り日</TableHead>
							<TableHead>操作</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{events
							.filter((event) => event.isPast === isPast)
							.map((event) => (
								<TableRow key={event.id}>
									<TableCell className="font-medium">{event.title}</TableCell>
									<TableCell>
										{new Date(event.date).toLocaleString("ja-JP")}
									</TableCell>
									<TableCell>
										{new Date(event.deadline).toLocaleString("ja-JP")}
									</TableCell>
									<TableCell>
										<div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
											<Button
												variant="outline"
												size="sm"
												className="w-full sm:w-auto"
												onClick={() =>
													router.push(`/events/detail?eventId=${event.id}`)
												}
											>
												<Eye className="h-4 w-4 mr-2" /> 詳細
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="w-full sm:w-auto"
												onClick={() =>
													router.push(`/events/edit?eventId=${event.id}`)
												}
											>
												<Edit className="h-4 w-4 mr-2" /> 編集
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="w-full sm:w-auto"
												onClick={() => handleDelete(event.id)}
											>
												<Trash2 className="h-4 w-4 mr-2" /> 削除
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</div>
		);
	};

	return (
		<div className="container mx-auto px-4 py-10">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">イベント一覧</h1>
				<Button onClick={() => router.push("/events/create")}>
					<PlusCircle className="mr-2 h-4 w-4" /> 新規イベント作成
				</Button>
			</div>

			<Tabs defaultValue="upcoming" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="upcoming">開催前</TabsTrigger>
					<TabsTrigger value="past">開催済み</TabsTrigger>
				</TabsList>
				<TabsContent value="upcoming">
					<Card>
						<CardHeader>
							<CardTitle>開催前のイベント</CardTitle>
						</CardHeader>
						<CardContent>
							<EventTable isPast={false} />
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="past">
					<Card>
						<CardHeader>
							<CardTitle>開催済みのイベント</CardTitle>
						</CardHeader>
						<CardContent>
							<EventTable isPast={true} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* トースト通知を表示するためのToasterコンポーネント */}
			<Toaster />
		</div>
	);
}

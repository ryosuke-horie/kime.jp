"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
}

interface ErrorResponse {
	errors?: { [key: string]: string[] };
	message?: string;
}

interface SuccessResponse {
	id: number;
}

export default function EventEditForm() {
	const [title, setTitle] = useState("");
	const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
	const [deadline, setDeadline] = useState<Date | undefined>(undefined);
	const [content, setContent] = useState("");
	const [notifyByEmail, setNotifyByEmail] = useState(false);
	const { toast } = useToast();
	const router = useRouter();
	const searchParams = useSearchParams();
	const eventId = searchParams.get("eventId");

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

				setTitle(data.title);
				setEventDate(parseISO(data.event_date));
				setDeadline(parseISO(data.deadline));
				setContent(data.content);
				setNotifyByEmail(data.notify_by_email);
			} catch (error: any) {
				toast({
					title: "エラー",
					description: "イベントの取得中にエラーが発生しました。",
					variant: "destructive",
				});
			}
		};

		fetchEventData();
	}, [eventId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title || !eventDate || !deadline || !content) {
			toast({
				title: "エラー",
				description: "すべての必須フィールドを入力してください。",
				variant: "destructive",
			});
			return;
		}

		try {
			const token = localStorage.getItem("admin-dojo-pass-token");
			if (!token) {
				throw new Error("認証トークンがありません。再度ログインしてください。");
			}

			const apiUrl = process.env.NEXT_PUBLIC_API_URL;
			const formData = new FormData();

			// 日付を 'Y-m-d H:i:s' 形式にフォーマット
			const eventDateFormatted = format(eventDate, "yyyy-MM-dd HH:mm:ss");
			const deadlineFormatted = format(deadline, "yyyy-MM-dd HH:mm:ss");

			formData.append("title", title);
			// 日時と締め切り日は変更不可なので、元の値を送信
			formData.append("event_date", eventDateFormatted);
			formData.append("deadline", deadlineFormatted);
			formData.append("content", content);
			formData.append("notify_by_email", notifyByEmail ? "1" : "0");

			const response = await fetch(
				`${apiUrl}/api/admin/events/${eventId}/update`,
				{
					method: "POST",
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				},
			);

			if (response.ok) {
				const data = (await response.json()) as SuccessResponse;

				toast({
					title: "成功",
					description: "イベントが更新されました。",
				});

				// 更新後にイベント一覧ページにリダイレクト
				router.push("/events");
			} else {
				const data = (await response.json()) as ErrorResponse;

				const errorMessages = Object.values(data.errors || {})
					.flat()
					.join("\n");
				throw new Error("イベントの更新に失敗しました。");
			}
		} catch (error: any) {
			toast({
				title: "エラー",
				description:
					error.message || "イベントの更新中にエラーが発生しました。",
				variant: "destructive",
			});
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow"
		>
			<h2 className="text-2xl font-bold mb-6">イベント編集</h2>

			<div>
				<label
					htmlFor="title"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					タイトル
				</label>
				<Input
					id="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
			</div>

			<div className="flex space-x-4">
				<div className="flex-1">
					{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
					<label className="block text-sm font-medium text-gray-700 mb-1">
						日時
					</label>
					<div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100">
						{eventDate ? (
							format(eventDate, "yyyy-MM-dd")
						) : (
							<span>日時が設定されていません</span>
						)}
					</div>
					<p className="text-sm text-gray-500 mt-1">
						日時は変更できません。変更したい場合は一度削除してから再度作成してください。
					</p>
				</div>

				<div className="flex-1">
					{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
					<label className="block text-sm font-medium text-gray-700 mb-1">
						締め切り日
					</label>
					<div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100">
						{deadline ? (
							format(deadline, "yyyy-MM-dd")
						) : (
							<span>締め切り日が設定されていません</span>
						)}
					</div>
					<p className="text-sm text-gray-500 mt-1">
						締め切り日は変更できません。変更したい場合は一度削除してから再度作成してください。
					</p>
				</div>
			</div>

			<div>
				<label
					htmlFor="content"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					内容・本文
				</label>
				<Textarea
					id="content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					rows={5}
					required
				/>
			</div>

			<div className="flex items-center space-x-2">
				<Checkbox
					id="notifyByEmail"
					checked={notifyByEmail}
					onCheckedChange={(checked) => setNotifyByEmail(checked as boolean)}
				/>
				<label
					htmlFor="notifyByEmail"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					メールでの通知を希望する
				</label>
			</div>

			<Button type="submit" className="w-full">
				イベントを更新
			</Button>

			{/* トースト通知を表示するためのToasterコンポーネント */}
			<Toaster />
		</form>
	);
}

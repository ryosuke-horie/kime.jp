"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EventCreationForm() {
	const [title, setTitle] = useState("");
	const [eventDate, setEventDate] = useState<Date | undefined>();
	const [deadline, setDeadline] = useState<Date | undefined>();
	const [content, setContent] = useState("");
	const [notifyByEmail, setNotifyByEmail] = useState(false);
	const { toast } = useToast();
	const router = useRouter();

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

		// 締切日がイベント日時より前であることを確認
		if (deadline >= eventDate) {
			toast({
				title: "エラー",
				description: "締切日はイベント日時より前の日付に設定してください。",
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
			formData.append("event_date", eventDateFormatted);
			formData.append("deadline", deadlineFormatted);
			formData.append("content", content);
			formData.append("notify_by_email", notifyByEmail ? "1" : "0");

			const response = await fetch(`${apiUrl}/api/admin/events`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error("イベントの作成に失敗しました。");
			}

			toast({
				title: "成功",
				description: "イベントが作成されました。",
			});

			// 作成後に詳細ページにリダイレクト
			router.push("/events");
		} catch (error: any) {
			toast({
				title: "エラー",
				description: "イベントの作成中にエラーが発生しました。",
				variant: "destructive",
			});
		}
	};

	// 締切日カレンダーで選択可能な最大日付を設定
	const maxDeadlineDate = eventDate
		? new Date(eventDate.getTime() - 86400000) // イベント日時の前日
		: undefined;

	// 締切日カレンダーで無効化する日付を設定
	const disabledDates = eventDate
		? {
				from: new Date(eventDate.getTime()),
			}
		: undefined;

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow"
		>
			<h2 className="text-2xl font-bold mb-6">イベント作成</h2>

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
					<label
						htmlFor="eventDate"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						日時
					</label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant={"outline"}
								className={`w-full justify-start text-left font-normal ${
									!eventDate && "text-muted-foreground"
								}`}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{eventDate ? (
									format(eventDate, "yyyy-MM-dd")
								) : (
									<span>日時を選択</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={eventDate}
								onSelect={setEventDate}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>

				<div className="flex-1">
					<label
						htmlFor="deadline"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						締め切り日
					</label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant={"outline"}
								className={`w-full justify-start text-left font-normal ${
									!deadline && "text-muted-foreground"
								}`}
								disabled={!eventDate} // 1. 日時が入力されるまで無効化
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{deadline ? (
									format(deadline, "yyyy-MM-dd")
								) : (
									<span>締め切り日を選択</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={deadline}
								onSelect={(date) => {
									// 選択された締切日がイベント日時より後の場合、設定しない
									if (eventDate && date && date >= eventDate) {
										toast({
											title: "エラー",
											description:
												"締切日はイベント日時より前の日付に設定してください。",
											variant: "destructive",
										});
										return;
									}
									setDeadline(date);
								}}
								initialFocus
								// カレンダーの無効化日付を設定
								disabled={disabledDates}
							/>
						</PopoverContent>
					</Popover>
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
				イベントを作成
			</Button>

			{/* トースト通知を表示するためのToasterコンポーネント */}
			<Toaster />
		</form>
	);
}

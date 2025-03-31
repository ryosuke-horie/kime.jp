"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { InfoIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// トースト通知用のコンポーネントをインポート
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

/**
 * レッスンスケジュールを表します。
 */
type Lesson = {
	/** レッスンの一意の識別子 */
	id: string;
	/** レッスンが行われる曜日 */
	day_of_week: string;
	/** レッスンの開始時間 */
	start_time: string;
	/** レッスンの終了時間 */
	end_time: string;
	/** クラス名 */
	class_name: string;
};

/**
 * 曜日ごとのレッスンを表します。
 */
type LessonsByDay = Record<string, Lesson[]>;

// 曜日リストを定義
const daysOfWeek = [
	"月曜日",
	"火曜日",
	"水曜日",
	"木曜日",
	"金曜日",
	"土曜日",
	"日曜日",
];

/**
 * レッスンスケジュールを管理するコンポーネント。
 *
 * レッスンの追加、編集、削除の機能を提供します。
 * 曜日ごとにレッスンをグループ化して表示します。
 */
export default function LessonSchedule() {
	// レッスンのグループ化されたリスト
	const [groupedLessons, setGroupedLessons] = useState<LessonsByDay>({});
	// 現在編集中のレッスン
	const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
	// ダイアログの開閉状態
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// トースト通知を表示するためのフック
	const { toast } = useToast();

	/**
	 * API URLが利用可能な場合にレッスンのリストを取得します。
	 */
	useEffect(() => {
		const fetchData = async () => {
			try {
				const apiUrl = process.env.NEXT_PUBLIC_API_URL;
				const response = await fetch(`${apiUrl}/api/admin/schedules`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						Authorization: `Bearer ${localStorage.getItem("admin-dojo-pass-token")}`,
					},
				});

				if (!response.ok) {
					const errorData = (await response.json()) as { message: string };
					throw new Error(errorData.message || "データの取得に失敗しました");
				}

				const data: LessonsByDay = await response.json();
				setGroupedLessons(data);
			} catch (error: any) {
				toast({
					variant: "destructive",
					title: "データの取得に失敗しました",
					description: "エラーが発生しました。",
					duration: 2000,
				});
			}
		};

		fetchData();
	}, [toast]);

	/**
	 * 新しいレッスンの追加を処理します。
	 */
	const handleAddLesson = useCallback((day: string) => {
		setEditingLesson({
			id: "",
			day_of_week: day,
			start_time: "",
			end_time: "",
			class_name: "",
		});
		setIsDialogOpen(true);
	}, []);

	/**
	 * 既存のレッスンの編集を処理します。
	 */
	const handleEditLesson = useCallback((lesson: Lesson) => {
		setEditingLesson(lesson);
		setIsDialogOpen(true);
	}, []);

	/**
	 * レッスンを開始時間でソートする関数
	 */
	const sortLessonsByStartTime = (lessons: Lesson[]): Lesson[] => {
		return lessons.sort((a, b) => (a.start_time > b.start_time ? 1 : -1));
	};

	/**
	 * 保存されたレッスンで `groupedLessons` の状態を更新します。
	 */
	const updateLessons = (savedLesson: Lesson) => {
		setGroupedLessons((prevGroupedLessons) => {
			const day = savedLesson.day_of_week;
			let dayLessons = prevGroupedLessons[day] || [];

			// 既存のレッスンを更新または新規追加
			if (dayLessons.some((lesson) => lesson.id === savedLesson.id)) {
				dayLessons = dayLessons.map((lesson) =>
					lesson.id === savedLesson.id ? savedLesson : lesson,
				);
			} else {
				dayLessons = [...dayLessons, savedLesson];
			}

			// 開始時間でソート
			dayLessons = sortLessonsByStartTime(dayLessons);

			return {
				...prevGroupedLessons,
				[day]: dayLessons,
			};
		});
	};

	/**
	 * レッスンIDによって `groupedLessons` の状態からレッスンを削除します。
	 */
	const removeLesson = (lessonId: string, day: string) => {
		setGroupedLessons((prevGroupedLessons) => {
			const updatedDayLessons =
				prevGroupedLessons[day]?.filter((lesson) => lesson.id !== lessonId) ||
				[];

			return {
				...prevGroupedLessons,
				[day]: updatedDayLessons,
			};
		});
	};

	/**
	 * レッスンの削除を処理します。
	 */
	const handleDeleteLesson = async (lessonId: string, day: string) => {
		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL;
			const response = await fetch(
				`${apiUrl}/api/admin/schedules/${lessonId}`,
				{
					method: "DELETE",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("admin-dojo-pass-token")}`,
					},
				},
			);

			if (!response.ok) {
				const errorData = (await response.json()) as { message: string };
				throw new Error(errorData.message || "削除に失敗しました");
			}

			removeLesson(lessonId, day);
			setIsDialogOpen(false);

			toast({
				variant: "default",
				title: "削除に成功しました",
				description: "レッスンが正常に削除されました。",
				duration: 2000,
			});
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "レッスンの削除に失敗しました",
				description: "エラーが発生しました。",
				duration: 2000,
			});
		}
	};

	/**
	 * レッスンの保存を処理します（新規作成または既存のレッスンの更新）。
	 */
	const handleSaveLesson = async (updatedLesson: Lesson) => {
		try {
			let response: Response;
			if (updatedLesson.id) {
				const apiUrl = process.env.NEXT_PUBLIC_API_URL;
				// 更新
				response = await fetch(
					`${apiUrl}/api/admin/schedules/${updatedLesson.id}`,
					{
						method: "POST",
						headers: {
							Accept: "application/json",
							"Content-Type": "application/json",
							Authorization: `Bearer ${localStorage.getItem("admin-dojo-pass-token")}`,
						},
						body: JSON.stringify(updatedLesson),
					},
				);
			} else {
				// 新規追加
				const apiUrl = process.env.NEXT_PUBLIC_API_URL;
				response = await fetch(`${apiUrl}/api/admin/schedules`, {
					method: "POST",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("admin-dojo-pass-token")}`,
					},
					body: JSON.stringify(updatedLesson),
				});
			}

			if (!response.ok) {
				const errorData = (await response.json()) as { message: string };
				throw new Error(errorData.message || "保存に失敗しました");
			}

			const savedLesson: Lesson = await response.json();

			updateLessons(savedLesson);

			toast({
				variant: "default",
				title: updatedLesson.id ? "更新に成功しました" : "追加に成功しました",
				description: `レッスンが正常に${
					updatedLesson.id ? "更新" : "追加"
				}されました。`,
				duration: 2000,
			});

			setIsDialogOpen(false);
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "レッスンの保存に失敗しました",
				description: "エラーが発生しました。",
				duration: 2000,
			});
		}
	};

	return (
		<div className="container mx-auto px-4">
			<h1 className="text-2xl font-bold mb-6 text-center">
				タイムテーブル設定・編集
			</h1>

			<Alert className="mb-6">
				<InfoIcon className="h-4 w-4" />
				<AlertDescription>
					ジムの会員は、タイムテーブルの開始時間の15分前から終了時間の15分前までの範囲で練習記録を提出します。
				</AlertDescription>
			</Alert>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{/* 曜日ごとのカードをレンダリング */}
				{daysOfWeek.map((day) => {
					const dayLessons = groupedLessons[day] || [];
					return (
						<Card key={day} className="w-full">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle>{day}</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleAddLesson(day)}
								>
									<PlusIcon className="h-4 w-4" />
								</Button>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2">
									{/* その日のレッスンをレンダリング */}
									{dayLessons.length > 0 ? (
										dayLessons.map((lesson) => (
											<li
												key={lesson.id}
												className="bg-secondary p-3 rounded-md flex justify-between items-center"
											>
												<div>
													<div className="font-semibold">
														{lesson.class_name}
													</div>
													<div className="text-sm text-muted-foreground">
														{lesson.start_time} - {lesson.end_time}
													</div>
												</div>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEditLesson(lesson)}
												>
													<PencilIcon className="h-4 w-4" />
												</Button>
											</li>
										))
									) : (
										<p className="text-sm text-muted-foreground">
											レッスンが登録されていません。
										</p>
									)}
								</ul>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* レッスンの追加・編集用ダイアログ */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingLesson?.id ? "レッスンを編集" : "新しいレッスンを追加"}
						</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							if (editingLesson) {
								await handleSaveLesson(editingLesson);
							}
						}}
						className="space-y-4"
					>
						<div>
							<Label htmlFor="class_name">クラス名</Label>
							<Input
								id="class_name"
								value={editingLesson?.class_name || ""}
								onChange={(e) =>
									setEditingLesson({
										...editingLesson!,
										class_name: e.target.value,
									})
								}
								required
							/>
						</div>
						<div>
							<Label htmlFor="day_of_week">曜日</Label>
							<Select
								value={editingLesson?.day_of_week || ""}
								onValueChange={(value) =>
									setEditingLesson({ ...editingLesson!, day_of_week: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="曜日を選択" />
								</SelectTrigger>
								<SelectContent>
									{[
										"月曜日",
										"火曜日",
										"水曜日",
										"木曜日",
										"金曜日",
										"土曜日",
										"日曜日",
									].map((day) => (
										<SelectItem key={day} value={day}>
											{day}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="start_time">開始時間</Label>
							<Input
								id="start_time"
								type="time"
								value={editingLesson?.start_time || ""}
								onChange={(e) =>
									setEditingLesson({
										...editingLesson!,
										start_time: e.target.value,
									})
								}
								required
							/>
						</div>
						<div>
							<Label htmlFor="end_time">終了時間</Label>
							<Input
								id="end_time"
								type="time"
								value={editingLesson?.end_time || ""}
								onChange={(e) =>
									setEditingLesson({
										...editingLesson!,
										end_time: e.target.value,
									})
								}
								required
							/>
						</div>
						<div className="flex justify-between">
							<Button type="submit">
								{editingLesson?.id ? "更新" : "追加"}
							</Button>
							{editingLesson?.id && (
								<Button
									type="button"
									variant="destructive"
									onClick={() =>
										handleDeleteLesson(
											editingLesson.id,
											editingLesson.day_of_week,
										)
									}
								>
									削除
								</Button>
							)}
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* トースト通知を表示するためのToasterコンポーネント */}
			<Toaster />
		</div>
	);
}

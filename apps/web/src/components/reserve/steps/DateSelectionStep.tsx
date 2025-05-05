"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import type { ReservationFormData } from "../ReservationWizard";

// モックデータ - 後で実際のAPIに置き換え
const mockClasses = [
	{
		id: "class-1",
		name: "ボクシング入門",
		time: "10:00-11:00",
		capacity: 10,
		available: 5,
	},
	{
		id: "class-2",
		name: "キックボクシング",
		time: "12:00-13:00",
		capacity: 8,
		available: 2,
	},
	{
		id: "class-3",
		name: "総合格闘技",
		time: "15:00-16:30",
		capacity: 6,
		available: 0,
	},
	{
		id: "class-4",
		name: "柔術基礎",
		time: "18:00-19:30",
		capacity: 12,
		available: 8,
	},
];

type DateSelectionStepProps = {
	formData: ReservationFormData;
	updateFormData: (data: Partial<ReservationFormData>) => void;
};

export default function DateSelectionStep({
	formData,
	updateFormData,
}: DateSelectionStepProps) {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		formData.date,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [availableClasses, setAvailableClasses] = useState(mockClasses);

	// 日付が変更されたときの処理
	useEffect(() => {
		if (selectedDate) {
			setIsLoading(true);

			// モックデータを使用 - 実際のアプリでは、選択された日付に基づいてAPIから利用可能なクラスを取得
			setTimeout(() => {
				setAvailableClasses(mockClasses);
				setIsLoading(false);
			}, 500); // モックの読み込み遅延

			// formDataを更新
			updateFormData({ date: selectedDate });
		}
	}, [selectedDate, updateFormData]);

	// クラス選択時の処理
	const handleClassSelect = (classId: string) => {
		const selectedClass = availableClasses.find((c) => c.id === classId);
		if (selectedClass) {
			updateFormData({
				classId: selectedClass.id,
				className: selectedClass.name,
				timeSlot: selectedClass.time,
				gymId: "gym-1", // ジムIDは本来はAPIから取得するか、コンテキストから取得
			});
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-semibold mb-4">1. 日付を選択</h2>
				<Calendar
					mode="single"
					selected={selectedDate}
					onSelect={setSelectedDate}
					className="mx-auto border rounded-md p-4"
					disabled={(date) => {
						// 現在の日付より前の日付は予約不可
						const today = new Date();
						today.setHours(0, 0, 0, 0);
						return date < today;
					}}
				/>
			</div>

			<div>
				<h2 className="text-lg font-semibold mb-4">2. クラスを選択</h2>
				{selectedDate ? (
					isLoading ? (
						<div className="space-y-2">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-24 w-full" />
						</div>
					) : (
						<div className="space-y-4">
							<Label htmlFor="class-select">利用可能なクラス</Label>
							<Select
								value={formData.classId}
								onValueChange={handleClassSelect}
							>
								<SelectTrigger className="w-full" id="class-select">
									<SelectValue placeholder="クラスを選択してください" />
								</SelectTrigger>
								<SelectContent>
									{availableClasses.map((cls) => (
										<SelectItem
											key={cls.id}
											value={cls.id}
											disabled={cls.available === 0}
										>
											{cls.name} ({cls.time}) - 残り{cls.available}枠
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{formData.classId && (
								<Card>
									<CardContent className="p-4 mt-4">
										<h3 className="font-semibold mb-2">選択済みクラス</h3>
										<p>クラス: {formData.className}</p>
										<p>時間: {formData.timeSlot}</p>
										<p>日付: {selectedDate?.toLocaleDateString()}</p>
									</CardContent>
								</Card>
							)}
						</div>
					)
				) : (
					<p className="text-muted-foreground text-center p-4">
						まずは上のカレンダーから日付を選択してください
					</p>
				)}
			</div>
		</div>
	);
}

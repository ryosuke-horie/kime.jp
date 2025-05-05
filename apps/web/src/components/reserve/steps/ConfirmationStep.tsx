"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReservationFormData } from "../ReservationWizard";

type ConfirmationStepProps = {
	formData: ReservationFormData;
	updateFormData: (data: Partial<ReservationFormData>) => void;
};

export default function ConfirmationStep({
	formData,
	updateFormData,
}: ConfirmationStepProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [consentGiven, setConsentGiven] = useState(false);

	// 予約送信処理 (モック)
	const handleSubmitReservation = async () => {
		if (!consentGiven) return;

		setIsSubmitting(true);

		try {
			// モック通信 - 実際のアプリではAPIを呼び出す
			// API呼び出しの例：
			// const response = await fetch('/api/bookings', {
			//    method: 'POST',
			//    headers: { 'Content-Type': 'application/json' },
			//    body: JSON.stringify({
			//        gymId: formData.gymId,
			//        classId: formData.classId,
			//        memberId: response.memberId, // 会員IDはサーバー側で生成またはユーザーデータから取得
			//    })
			// });

			// モック通信の遅延をシミュレート
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// 成功時は予約完了ページへ遷移
			router.push("/reserve/complete?bookingId=mock-123");
		} catch (error) {
			console.error("Reservation submission error:", error);
			// エラー処理
			setIsSubmitting(false);
		}
	};

	// 同意チェックボックスの状態変更
	const handleConsentChange = (checked: boolean) => {
		setConsentGiven(checked);
	};

	// フォーマット関数
	const formatDate = (date?: Date) => {
		if (!date) return "未選択";
		return date.toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "long",
			day: "numeric",
			weekday: "long",
		});
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-semibold mb-4">予約内容の確認</h2>
				<p className="text-muted-foreground mb-6">
					以下の内容で予約を確定します。内容をご確認ください。
				</p>

				<Card className="mb-6">
					<CardContent className="p-6 space-y-4">
						<div>
							<h3 className="font-semibold text-sm text-muted-foreground">
								クラス情報
							</h3>
							<p className="text-lg font-medium">
								{formData.className || "未選択"}
							</p>
							<p>
								日時: {formatDate(formData.date)} {formData.timeSlot || ""}
							</p>
						</div>

						<Separator />

						<div>
							<h3 className="font-semibold text-sm text-muted-foreground">
								お客様情報
							</h3>
							<p>
								<span className="font-medium">お名前:</span>{" "}
								{formData.fullName || "未入力"}
							</p>
							<p>
								<span className="font-medium">メール:</span>{" "}
								{formData.email || "未入力"}
							</p>
							<p>
								<span className="font-medium">電話番号:</span>{" "}
								{formData.phone || "未入力"}
							</p>
						</div>
					</CardContent>
				</Card>

				<div className="flex items-start space-x-2 mb-6">
					<Checkbox
						id="privacy-consent"
						checked={consentGiven}
						onCheckedChange={handleConsentChange}
					/>
					<div className="grid gap-1.5 leading-none">
						<Label
							htmlFor="privacy-consent"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							個人情報の取り扱いに同意する
						</Label>
						<p className="text-xs text-muted-foreground">
							予約には個人情報の取り扱いに関する同意が必要です。
							<a
								href="/privacy"
								className="text-primary hover:underline"
								target="_blank"
								rel="noreferrer"
							>
								プライバシーポリシー
							</a>
							をご確認ください。
						</p>
					</div>
				</div>

				<Button
					className="w-full"
					onClick={handleSubmitReservation}
					disabled={isSubmitting || !consentGiven}
				>
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							予約処理中...
						</>
					) : (
						"予約を確定する"
					)}
				</Button>
			</div>
		</div>
	);
}

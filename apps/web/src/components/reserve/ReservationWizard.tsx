"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useState } from "react";
import ConfirmationStep from "./steps/ConfirmationStep";
import DateSelectionStep from "./steps/DateSelectionStep";
import PersonalInfoStep from "./steps/PersonalInfoStep";

// ステップの定義
const STEPS = {
	DATE_SELECTION: 0,
	PERSONAL_INFO: 1,
	CONFIRMATION: 2,
};

// フォームデータの型定義
export type ReservationFormData = {
	classId?: string;
	className?: string;
	date?: Date;
	timeSlot?: string;
	fullName?: string;
	email?: string;
	phone?: string;
	gymId?: string;
};

export default function ReservationWizard() {
	const [step, setStep] = useState(STEPS.DATE_SELECTION);
	const [formData, setFormData] = useState<ReservationFormData>({});

	// 現在のステップのコンポーネントを返す
	const renderStep = () => {
		switch (step) {
			case STEPS.DATE_SELECTION:
				return (
					<DateSelectionStep
						formData={formData}
						updateFormData={(data) => setFormData({ ...formData, ...data })}
					/>
				);
			case STEPS.PERSONAL_INFO:
				return (
					<PersonalInfoStep
						formData={formData}
						updateFormData={(data) => setFormData({ ...formData, ...data })}
					/>
				);
			case STEPS.CONFIRMATION:
				return (
					<ConfirmationStep
						formData={formData}
						updateFormData={(data) => setFormData({ ...formData, ...data })}
					/>
				);
			default:
				return null;
		}
	};

	// 前のステップに戻る
	const prevStep = () => {
		if (step > 0) {
			setStep(step - 1);
		}
	};

	// 次のステップに進む
	const nextStep = () => {
		if (step < Object.keys(STEPS).length - 1) {
			setStep(step + 1);
		}
	};

	// 現在のステップに基づいて進むボタンのテキストを返す
	const getNextButtonText = () => {
		switch (step) {
			case STEPS.DATE_SELECTION:
				return "次へ：お客様情報";
			case STEPS.PERSONAL_INFO:
				return "次へ：予約内容確認";
			case STEPS.CONFIRMATION:
				return "予約を確定する";
			default:
				return "次へ";
		}
	};

	// 現在のステップに基づいてボタンの有効/無効を決定する
	const isNextButtonDisabled = () => {
		switch (step) {
			case STEPS.DATE_SELECTION:
				return !formData.classId || !formData.date;
			case STEPS.PERSONAL_INFO:
				return !formData.fullName || !formData.email || !formData.phone;
			case STEPS.CONFIRMATION:
				return false;
			default:
				return false;
		}
	};

	// 予約ウィザードの進行状況を表示
	const renderProgress = () => {
		const totalSteps = Object.keys(STEPS).length;
		const progress = ((step + 1) / totalSteps) * 100;

		return (
			<div className="w-full mb-6">
				<div className="flex justify-between mb-2">
					<span className="text-sm font-medium">
						予約ステップ {step + 1}/{totalSteps}
					</span>
					<span className="text-sm font-medium">{Math.round(progress)}%</span>
				</div>
				<div className="w-full bg-muted rounded-full h-2">
					<div
						className="bg-primary h-2 rounded-full"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
		);
	};

	return (
		<Card className="w-full">
			<CardContent className="p-6">
				{renderProgress()}
				<div className="min-h-[400px]">{renderStep()}</div>
			</CardContent>
			<CardFooter className="flex justify-between p-6 pt-0">
				{step > 0 ? (
					<Button variant="outline" onClick={prevStep}>
						戻る
					</Button>
				) : (
					<div /> // 最初のステップでは「戻る」ボタンを表示しない代わりの空要素
				)}
				<Button onClick={nextStep} disabled={isNextButtonDisabled()}>
					{getNextButtonText()}
				</Button>
			</CardFooter>
		</Card>
	);
}

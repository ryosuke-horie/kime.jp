"use client";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ReservationFormData } from "../ReservationWizard";

// 個人情報フォームのバリデーションスキーマ
const personalInfoSchema = z.object({
	fullName: z.string().min(1, "お名前を入力してください"),
	email: z.string().email("有効なメールアドレスを入力してください"),
	phone: z.string().min(10, "有効な電話番号を入力してください"),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

type PersonalInfoStepProps = {
	formData: ReservationFormData;
	updateFormData: (data: Partial<ReservationFormData>) => void;
};

export default function PersonalInfoStep({
	formData,
	updateFormData,
}: PersonalInfoStepProps) {
	// React Hook Formの初期化
	const form = useForm<PersonalInfoValues>({
		resolver: zodResolver(personalInfoSchema),
		defaultValues: {
			fullName: formData.fullName || "",
			email: formData.email || "",
			phone: formData.phone || "",
		},
	});

	// フォームの値が変更されたら親コンポーネントのステートを更新
	useEffect(() => {
		const subscription = form.watch((value) => {
			updateFormData({
				fullName: value.fullName,
				email: value.email,
				phone: value.phone,
			});
		});

		return () => subscription.unsubscribe();
	}, [form, updateFormData]);

	// フォーム送信時のハンドラー - ウィザードの場合は実際には使わないがバリデーション用
	const onSubmit = (data: PersonalInfoValues) => {
		updateFormData(data);
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-semibold mb-4">お客様情報</h2>
				<p className="text-muted-foreground mb-6">
					予約の確認や当日のご案内に使用します。正確な情報をご入力ください。
				</p>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="fullName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>お名前</FormLabel>
									<FormControl>
										<Input placeholder="例：山田 太郎" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>メールアドレス</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="例：example@gmail.com"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>電話番号</FormLabel>
									<FormControl>
										<Input
											type="tel"
											placeholder="例：09012345678（ハイフンなし）"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* このボタンは実際には表示されないが、フォームの送信に必要 */}
						<button type="submit" className="hidden" />
					</form>
				</Form>
			</div>
		</div>
	);
}

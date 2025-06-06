"use client";

import { useGym, useUpdateGym } from "@/api/hooks";
import { DashboardLayout } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Zodでフォームのバリデーションスキーマを定義
const gymFormSchema = z.object({
	name: z.string().min(1, {
		message: "ジム名は必須です",
	}),
	ownerEmail: z.string().email({
		message: "有効なメールアドレスを入力してください",
	}),
	password: z
		.string()
		.min(8, {
			message: "パスワードは8文字以上で入力してください",
		})
		.optional()
		.or(z.literal("")),
	phone: z.string().optional(),
	website: z
		.string()
		.url({
			message: "有効なURLを入力してください",
		})
		.optional()
		.or(z.literal("")),
	address: z.string().optional(),
	description: z.string().optional(),
});

type GymFormValues = z.infer<typeof gymFormSchema>;

export default function EditGymPage() {
	const params = useParams();
	const gymId = params.gymId as string;
	const router = useRouter();
	const { fetchGym } = useGym(gymId);
	const { updateGym } = useUpdateGym(gymId);
	const [isLoading, setIsLoading] = useState(true);

	// フォームの初期化
	const form = useForm<GymFormValues>({
		// @ts-ignore TypeScriptの型推論の深度問題であり、実行時には問題なし
		resolver: zodResolver(gymFormSchema),
		defaultValues: {
			name: "",
			ownerEmail: "",
			password: "",
			phone: "",
			website: "",
			address: "",
			description: "",
		},
	});

	// ページロード時にジム情報を取得
	// biome-ignore lint/correctness/useExhaustiveDependencies: fetchGym、form.reset、router.pushは毎回新しい参照になるため依存関係に含めると無限ループが発生する
	useEffect(() => {
		// エラー発生時に無限ループを防ぐためのフラグ
		let isMounted = true;
		const loadGymData = async () => {
			try {
				setIsLoading(true);
				const data = await fetchGym();

				// コンポーネントがアンマウントされていなければ処理を続行
				if (isMounted) {
					// フォームに既存データをセット
					form.reset({
						name: data.gym.name,
						ownerEmail: data.gym.ownerEmail,
						// 他のフィールドはAPIに未実装のため、空文字をデフォルト値として使用
						phone: "",
						website: "",
						address: "",
						description: "",
					});
				}
			} catch (error) {
				// コンポーネントがアンマウントされていなければエラー表示
				if (isMounted) {
					console.error("ジム情報取得エラー:", error);
					toast.error("ジム情報の取得に失敗しました", {
						description: error instanceof Error ? error.message : "不明なエラーが発生しました",
					});
					// エラー発生時はジム一覧ページに戻す
					router.push("/admin/gyms");
				}
			} finally {
				// コンポーネントがアンマウントされていなければローディング状態を更新
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadGymData();

		// クリーンアップ関数
		return () => {
			isMounted = false;
		};
	}, []);

	// フォーム送信処理
	async function onSubmit(values: GymFormValues) {
		try {
			// ジム更新に必要なデータを準備
			const updateData: any = {
				name: values.name,
				ownerEmail: values.ownerEmail,
				// 拡張フィールド（APIで対応済み）
				phone: values.phone,
				website: values.website,
				address: values.address,
				description: values.description,
			};

			// パスワードが入力された場合のみ追加
			if (values.password) {
				updateData.password = values.password;
			}

			await updateGym(updateData);

			toast.success("ジム情報を更新しました", {
				description: `ジムID: ${gymId}`,
			});

			// 更新成功後、ジム一覧ページに遷移
			router.push("/admin/gyms");
		} catch (error) {
			console.error("ジム更新エラー:", error);
			toast.error("ジム更新に失敗しました", {
				description: error instanceof Error ? error.message : "不明なエラーが発生しました",
			});
		}
	}

	return (
		<DashboardLayout>
			<div className="flex flex-col gap-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">ジム情報編集</h1>
						<p className="text-muted-foreground">ジムの情報を更新します</p>
					</div>
					<Button variant="outline" asChild>
						<Link href="/admin/gyms">ジム一覧に戻る</Link>
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>ジム情報</CardTitle>
						<CardDescription>ジムの基本情報を編集してください</CardDescription>
					</CardHeader>
					{isLoading ? (
						<CardContent>
							<div className="flex items-center justify-center p-6">
								<p>データ読み込み中...</p>
							</div>
						</CardContent>
					) : (
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
								<CardContent>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														ジム名 <span className="text-red-500">※</span>
													</FormLabel>
													<FormControl>
														<Input placeholder="ジム名を入力" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="ownerEmail"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														メールアドレス <span className="text-red-500">※</span>
													</FormLabel>
													<FormControl>
														<Input type="email" placeholder="連絡先メールアドレス" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="password"
											render={({ field }) => (
												<FormItem>
													<FormLabel>パスワード変更（任意）</FormLabel>
													<FormControl>
														<Input
															type="password"
															placeholder="新しいパスワード（8文字以上）"
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
														<Input placeholder="電話番号" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="website"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Webサイト</FormLabel>
													<FormControl>
														<Input placeholder="https://example.com" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="address"
											render={({ field }) => (
												<FormItem className="md:col-span-2">
													<FormLabel>住所</FormLabel>
													<FormControl>
														<Input placeholder="住所を入力" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="description"
											render={({ field }) => (
												<FormItem className="md:col-span-2">
													<FormLabel>説明</FormLabel>
													<FormControl>
														<Textarea
															placeholder="ジムの説明や特徴を入力してください"
															rows={4}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</CardContent>
								<CardFooter className="flex justify-between">
									<Button variant="outline" type="button" asChild>
										<Link href="/admin/gyms">キャンセル</Link>
									</Button>
									<Button type="submit">保存</Button>
								</CardFooter>
							</form>
						</Form>
					)}
				</Card>
			</div>
		</DashboardLayout>
	);
}

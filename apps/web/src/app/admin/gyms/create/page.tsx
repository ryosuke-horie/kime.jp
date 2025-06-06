"use client";

import { useCreateGym } from "@/api/hooks";
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
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
	password: z.string().min(8, {
		message: "パスワードは8文字以上で入力してください",
	}),
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

export default function CreateGymPage() {
	const router = useRouter();
	const { createGym } = useCreateGym();
	const queryClient = useQueryClient();

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

	// フォーム送信処理
	async function onSubmit(values: GymFormValues) {
		try {
			const gymData = {
				name: values.name,
				ownerEmail: values.ownerEmail,
				password: values.password,
				// 拡張フィールド（APIで対応済み）
				phone: values.phone || undefined,
				website: values.website || undefined,
				address: values.address || undefined,
				description: values.description || undefined,
			};

			const response = await createGym(gymData);

			toast.success("ジムを登録しました", {
				description: `ジムID: ${response.gymId}`,
			});

			// ジム一覧のキャッシュを無効化して再取得を促す
			await queryClient.invalidateQueries({ queryKey: ["gyms"] });

			// 登録成功後、ジム一覧ページに遷移
			router.push("/admin/gyms");
		} catch (error) {
			console.error("ジム登録エラー:", error);
			toast.error("ジム登録に失敗しました", {
				description: error instanceof Error ? error.message : "不明なエラーが発生しました",
			});
		}
	}

	return (
		<DashboardLayout>
			<div className="flex flex-col gap-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">新規ジム登録</h1>
						<p className="text-muted-foreground">新しいジムを登録してシステムに追加します</p>
					</div>
					<Button variant="outline" asChild>
						<Link href="/admin/gyms">ジム一覧に戻る</Link>
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>ジム情報</CardTitle>
						<CardDescription>ジムの基本情報を入力してください</CardDescription>
					</CardHeader>
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
												<FormLabel>
													ログインパスワード <span className="text-red-500">※</span>
												</FormLabel>
												<FormControl>
													<Input type="password" placeholder="8文字以上のパスワード" {...field} />
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
				</Card>
			</div>
		</DashboardLayout>
	);
}

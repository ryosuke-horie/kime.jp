"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function CreateGymPage() {
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
					<CardContent>
						<form className="space-y-6">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="name">ジム名</Label>
									<Input id="name" placeholder="ジム名を入力" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">メールアドレス</Label>
									<Input id="email" type="email" placeholder="連絡先メールアドレス" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="phone">電話番号</Label>
									<Input id="phone" placeholder="電話番号" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="website">Webサイト</Label>
									<Input id="website" placeholder="https://example.com" />
								</div>
								<div className="space-y-2 md:col-span-2">
									<Label htmlFor="address">住所</Label>
									<Input id="address" placeholder="住所を入力" />
								</div>
								<div className="space-y-2 md:col-span-2">
									<Label htmlFor="description">説明</Label>
									<Textarea
										id="description"
										placeholder="ジムの説明や特徴を入力してください"
										rows={4}
									/>
								</div>
							</div>
						</form>
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button variant="outline" asChild>
							<Link href="/admin/gyms">キャンセル</Link>
						</Button>
						<Button type="submit">保存</Button>
					</CardFooter>
				</Card>
			</div>
		</DashboardLayout>
	);
}

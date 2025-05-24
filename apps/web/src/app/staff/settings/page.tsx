"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Building, Save, Shield, User } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
	const { data: session } = useSession();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">設定</h1>
				<p className="text-muted-foreground mt-2">システムとプロフィールの設定管理</p>
			</div>

			<Tabs defaultValue="profile" className="space-y-4">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="profile" className="flex items-center">
						<User className="mr-2 h-4 w-4" />
						プロフィール
					</TabsTrigger>
					<TabsTrigger value="gym" className="flex items-center">
						<Building className="mr-2 h-4 w-4" />
						ジム設定
					</TabsTrigger>
					<TabsTrigger value="notifications" className="flex items-center">
						<Bell className="mr-2 h-4 w-4" />
						通知設定
					</TabsTrigger>
					<TabsTrigger value="security" className="flex items-center">
						<Shield className="mr-2 h-4 w-4" />
						セキュリティ
					</TabsTrigger>
				</TabsList>

				<TabsContent value="profile" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<User className="mr-2 h-5 w-5" />
								プロフィール設定
							</CardTitle>
							<CardDescription>あなたの基本情報を管理します</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName">名前</Label>
									<Input
										id="firstName"
										defaultValue={session?.user?.name?.split(" ")[1] || "太郎"}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName">苗字</Label>
									<Input
										id="lastName"
										defaultValue={session?.user?.name?.split(" ")[0] || "山田"}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">メールアドレス</Label>
								<Input
									id="email"
									type="email"
									defaultValue={session?.user?.email || "admin@example.com"}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="phone">電話番号</Label>
								<Input id="phone" defaultValue="090-1234-5678" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="role">役職</Label>
								<Select defaultValue="manager">
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="manager">マネージャー</SelectItem>
										<SelectItem value="instructor">インストラクター</SelectItem>
										<SelectItem value="staff">スタッフ</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<Button>
								<Save className="mr-2 h-4 w-4" />
								保存
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="gym" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Building className="mr-2 h-5 w-5" />
								ジム基本情報
							</CardTitle>
							<CardDescription>ジムの基本設定を管理します</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="gymName">ジム名</Label>
								<Input id="gymName" defaultValue="キメ格闘技ジム" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="address">住所</Label>
								<Input id="address" defaultValue="東京都渋谷区〇〇1-2-3" />
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="phone">電話番号</Label>
									<Input id="phone" defaultValue="03-1234-5678" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">メール</Label>
									<Input id="email" defaultValue="info@kime-gym.com" />
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">ジム紹介</Label>
								<Textarea
									id="description"
									defaultValue="都内最高峰の格闘技ジム。初心者から上級者まで対応。"
									rows={3}
								/>
							</div>
							<Separator />
							<div className="space-y-4">
								<h4 className="font-semibold">営業時間</h4>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="openTime">開館時間</Label>
										<Input id="openTime" type="time" defaultValue="06:00" />
									</div>
									<div className="space-y-2">
										<Label htmlFor="closeTime">閉館時間</Label>
										<Input id="closeTime" type="time" defaultValue="23:00" />
									</div>
								</div>
							</div>
							<Button>
								<Save className="mr-2 h-4 w-4" />
								保存
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="notifications" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Bell className="mr-2 h-5 w-5" />
								通知設定
							</CardTitle>
							<CardDescription>システム通知の設定を管理します</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>新規予約通知</Label>
									<div className="text-sm text-muted-foreground">
										新しい予約が入った時に通知を受け取る
									</div>
								</div>
								<Switch defaultChecked />
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>キャンセル通知</Label>
									<div className="text-sm text-muted-foreground">
										予約がキャンセルされた時に通知を受け取る
									</div>
								</div>
								<Switch defaultChecked />
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>新規会員登録通知</Label>
									<div className="text-sm text-muted-foreground">
										新しい会員が登録された時に通知を受け取る
									</div>
								</div>
								<Switch defaultChecked />
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>月次レポート通知</Label>
									<div className="text-sm text-muted-foreground">
										月次レポートが作成された時に通知を受け取る
									</div>
								</div>
								<Switch />
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>メンテナンス通知</Label>
									<div className="text-sm text-muted-foreground">
										システムメンテナンスの通知を受け取る
									</div>
								</div>
								<Switch defaultChecked />
							</div>
							<Button>
								<Save className="mr-2 h-4 w-4" />
								保存
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="security" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Shield className="mr-2 h-5 w-5" />
								セキュリティ設定
							</CardTitle>
							<CardDescription>アカウントのセキュリティを管理します</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="currentPassword">現在のパスワード</Label>
								<Input id="currentPassword" type="password" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="newPassword">新しいパスワード</Label>
								<Input id="newPassword" type="password" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="confirmPassword">パスワード確認</Label>
								<Input id="confirmPassword" type="password" />
							</div>
							<Button>パスワードを変更</Button>
							<Separator />
							<div className="space-y-4">
								<h4 className="font-semibold">セッション管理</h4>
								<div className="text-sm text-muted-foreground">
									最終ログイン: 2024年1月21日 15:30
								</div>
								<Button variant="outline">すべてのセッションを終了</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

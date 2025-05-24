"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Edit, Mail, Phone, Plus, Search } from "lucide-react";

export default function MembersPage() {
	const memberData = [
		{
			id: "M001",
			name: "山田 太郎",
			email: "yamada@example.com",
			phone: "090-1234-5678",
			membershipType: "プレミアム",
			joinDate: "2023-01-15",
			status: "アクティブ",
			lastVisit: "2024-01-20",
		},
		{
			id: "M002",
			name: "鈴木 花子",
			email: "suzuki@example.com",
			phone: "090-2345-6789",
			membershipType: "スタンダード",
			joinDate: "2023-03-20",
			status: "アクティブ",
			lastVisit: "2024-01-19",
		},
		{
			id: "M003",
			name: "佐藤 健",
			email: "sato@example.com",
			phone: "090-3456-7890",
			membershipType: "プレミアム",
			joinDate: "2023-06-10",
			status: "休会中",
			lastVisit: "2023-12-15",
		},
		{
			id: "M004",
			name: "田中 美咲",
			email: "tanaka@example.com",
			phone: "090-4567-8901",
			membershipType: "ベーシック",
			joinDate: "2023-09-05",
			status: "アクティブ",
			lastVisit: "2024-01-21",
		},
	];

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "アクティブ":
				return "default";
			case "休会中":
				return "secondary";
			default:
				return "outline";
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">会員管理</h1>
					<p className="text-muted-foreground mt-2">会員情報の管理・編集</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					新規会員登録
				</Button>
			</div>

			{/* 会員統計カード */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">総会員数</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">54</div>
						<p className="text-xs text-muted-foreground">前月比 +12.3%</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">アクティブ会員</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">48</div>
						<p className="text-xs text-muted-foreground">89% 活動中</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">新規登録 (今月)</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">8</div>
						<p className="text-xs text-muted-foreground">前月比 +33%</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">休会中</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">6</div>
						<p className="text-xs text-muted-foreground">11% 休会中</p>
					</CardContent>
				</Card>
			</div>

			{/* 検索とフィルター */}
			<Card>
				<CardHeader>
					<CardTitle>会員一覧</CardTitle>
					<CardDescription>会員情報の検索・管理</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center space-x-2 mb-4">
						<div className="relative flex-1 max-w-sm">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input placeholder="会員名で検索..." className="pl-8" />
						</div>
						<Button variant="outline">フィルター</Button>
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>会員ID</TableHead>
								<TableHead>氏名</TableHead>
								<TableHead>連絡先</TableHead>
								<TableHead>会員種別</TableHead>
								<TableHead>ステータス</TableHead>
								<TableHead>最終来館</TableHead>
								<TableHead>操作</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{memberData.map((member) => (
								<TableRow key={member.id}>
									<TableCell className="font-mono">{member.id}</TableCell>
									<TableCell className="font-medium">{member.name}</TableCell>
									<TableCell>
										<div className="space-y-1">
											<div className="flex items-center text-sm">
												<Mail className="mr-1 h-3 w-3" />
												{member.email}
											</div>
											<div className="flex items-center text-sm">
												<Phone className="mr-1 h-3 w-3" />
												{member.phone}
											</div>
										</div>
									</TableCell>
									<TableCell>{member.membershipType}</TableCell>
									<TableCell>
										<Badge variant={getStatusBadgeVariant(member.status)}>{member.status}</Badge>
									</TableCell>
									<TableCell>{member.lastVisit}</TableCell>
									<TableCell>
										<Button variant="outline" size="sm">
											<Edit className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

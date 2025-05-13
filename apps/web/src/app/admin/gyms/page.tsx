"use client";

import { DashboardLayout } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AdminGymsPage() {
	return (
		<DashboardLayout>
			<div className="flex flex-col gap-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">ジム管理</h1>
						<p className="text-muted-foreground">登録されているジムの一覧表示と管理</p>
					</div>
					<Button asChild>
						<Link href="/admin/gyms/create">新規ジム追加</Link>
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>ジム一覧</CardTitle>
						<CardDescription>
							システムに登録されているすべてのジムを表示しています
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* ここにジム一覧の表が入る予定 */}
						<div className="py-8 text-center text-muted-foreground">
							登録済みのジムが表示されます（現在は未実装）
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	);
}

"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOut() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	// サインアウト処理
	const handleSignOut = async () => {
		setIsLoading(true);

		try {
			await signOut({ callbackUrl: "/" });
		} catch (error) {
			console.error("サインアウト中にエラーが発生しました:", error);
			setIsLoading(false);
		}
	};

	// キャンセル処理
	const handleCancel = () => {
		router.back();
	};

	return (
		<div className="container flex items-center justify-center min-h-screen py-12">
			<Card className="w-full max-w-md mx-auto">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl font-bold">ログアウト</CardTitle>
					<CardDescription>
						管理システムからログアウトしますか？
					</CardDescription>
				</CardHeader>

				<CardContent className="flex flex-col items-center p-6">
					<p className="mb-6 text-center text-muted-foreground">
						ログアウトすると、再度ログインするまでシステムにアクセスできなくなります。
					</p>
				</CardContent>

				<CardFooter className="flex justify-between p-6 pt-0">
					<Button variant="outline" onClick={handleCancel} disabled={isLoading}>
						キャンセル
					</Button>
					<Button
						variant="destructive"
						onClick={handleSignOut}
						disabled={isLoading}
					>
						{isLoading ? "ログアウト中..." : "ログアウト"}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function ContactMembers() {
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const token = localStorage.getItem("admin-dojo-pass-token");
			if (!token) {
				throw new Error("認証トークンがありません。再度ログインしてください。");
			}

			const apiUrl = process.env.NEXT_PUBLIC_API_URL;
			const response = await fetch(`${apiUrl}/api/admin/contact-members`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ message }),
			});

			const data: any = await response.json();

			if (!response.ok) {
				throw new Error("メッセージの送信に失敗しました。");
			}

			toast({
				title: "送信成功",
				description: "メッセージが会員に送信されました。",
			});

			// フォームをリセット
			setMessage("");
		} catch (error) {
			toast({
				title: "エラー",
				description: "メッセージの送信中にエラーが発生しました。",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-4xl">
				<CardHeader>
					<CardTitle className="text-center text-2xl font-bold sm:text-3xl md:text-4xl">
						会員へのメール連絡
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="message" className="text-lg sm:text-xl">
								メッセージ
							</Label>
							<Textarea
								id="message"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								required
								placeholder="会員に送信するメッセージを入力してください"
								rows={12}
								className="min-h-[200px] text-base sm:text-lg md:min-h-[300px]"
								aria-describedby="message-description"
							/>
							<p id="message-description" className="text-sm text-gray-500">
								このメッセージは全ての会員に送信されます。内容を慎重に確認してください。
							</p>
						</div>
						<Button
							type="submit"
							className="w-full text-lg sm:text-xl py-6 sm:py-8"
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-6 w-6 animate-spin" />
									送信中...
								</>
							) : (
								"送信"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* トースト通知を表示するためのToasterコンポーネント */}
			<Toaster />
		</main>
	);
}

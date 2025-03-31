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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

interface LoginResponse {
	token: string;
}

export default function Page() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");
		const apiUrl = process.env.NEXT_PUBLIC_API_URL;

		try {
			const response = await fetch(`${apiUrl}/api/admin/login`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			if (!response.ok) {
				throw new Error("ログインに失敗しました。");
			}

			const data: LoginResponse = await response.json();

			// トークンをローカルストレージに保存
			localStorage.setItem("admin-dojo-pass-token", data.token);

			// トークン保存後にルートをリダイレクト
			router.push("/users"); // 会員管理画面にリダイレクト
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("An unexpected error occurred");
			}
		}
	};

	return (
		<main className="flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
			<div className="w-full max-w-md">
				<Card>
					<form onSubmit={handleSubmit}>
						<CardHeader>
							<CardTitle className="text-2xl">ログイン</CardTitle>
							<CardDescription>
								メールアドレスとパスワードを入力してください。
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">メール</Label>
								<Input
									id="email"
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">パスワード</Label>
								<Input
									id="password"
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
							{error && <p className="text-red-500">{error}</p>}
						</CardContent>
						<CardFooter>
							<Button
								type="submit"
								className="w-full hover:bg-blue-500 transition-colors"
							>
								ログイン
							</Button>
						</CardFooter>
					</form>
				</Card>
			</div>
		</main>
	);
}

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
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";

interface LoginResponse {
	token: string;
}

export default function Component() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		const apiUrl = process.env.NEXT_PUBLIC_API_URL;

		try {
			const response = await fetch(`${apiUrl}/api/user/login`, {
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
			localStorage.setItem("dojo-pass-user-token", data.token);

			setTimeout(() => {
				window.location.href = "/";
			}, 1000);
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("An unexpected error occurred");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<main className="flex justify-center min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
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
									disabled={isLoading}
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
									disabled={isLoading}
								/>
							</div>
							{error && <p className="text-red-500">{error}</p>}
						</CardContent>
						<CardFooter>
							<Button
								type="submit"
								className="w-full hover:bg-blue-500 transition-colors"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										ログイン中...
									</>
								) : (
									"ログイン"
								)}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</div>
		</main>
	);
}

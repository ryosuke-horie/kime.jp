"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// エラーデータの型を定義
interface ErrorData {
	message?: string;
}

function EntryContent() {
	// ステータスを一元管理
	const [status, setStatus] = useState<
		"authChecking" | "loading" | "success" | "error" | "idle"
	>("authChecking");
	const [data, setData] = useState<any>(null);
	const [error, setError] = useState("");

	useEffect(() => {
		checkAuth();
	}, []);

	// 認証状態を確認する関数
	const checkAuth = async () => {
		const token = localStorage.getItem("dojo-pass-user-token");

		if (!token) {
			// loginページへリダイレクト
			window.location.href = "/login";
			return;
		}

		// 認証済みの場合はデータ取得を開始
		setStatus("loading"); // 状態を更新
		fetchData();
	};

	// 練習記録APIを呼び出す関数
	// 注意：開発時はnext.config.jsでstrict modeを無効にしないと2回呼び出して登録済みといわれる
	const fetchData = async () => {
		const apiUrl = process.env.NEXT_PUBLIC_API_URL;

		if (!apiUrl) {
			setError("API URLが設定されていません。");
			setStatus("error");
			return;
		}

		try {
			const entryEndPoint = `${apiUrl}/api/user/entry`;
			const response = await fetch(entryEndPoint, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("dojo-pass-user-token")}`,
				},
			});

			if (!response.ok) {
				// エラーレスポンスの内容を取得
				const errorData: ErrorData = await response.json();

				// ステータスコードに応じてエラーメッセージを設定
				if (response.status === 404) {
					throw new Error(
						"現在の時間はクラスの時間外です。練習記録はレッスン開始15分前から、終了15分前まで受け付けています。",
					);
				}

				if (response.status === 400) {
					throw new Error("練習記録を登録済みです。");
				}

				// ログイントークンがない可能性を考慮しエラーメッセージを表示
				throw new Error("ログイン後、再度QRコードを読み取り記録してください。");
			}

			const data = await response.json();
			setData(data);
			setStatus("success");
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError(String(err));
			}
			setStatus("error");
		}
	};

	// 共通のローディングコンテンツ
	const LoadingContent = ({ message }: { message: string }) => (
		<CardContent className="flex flex-col items-center">
			<p className="mb-4">{message}</p>
			<Loader2 className="animate-spin" />
		</CardContent>
	);

	return (
		<Card className="max-w-md mx-auto mt-10">
			{status === "authChecking" ? (
				<LoadingContent message="ログイン状態を確認中..." />
			) : status === "loading" ? (
				<LoadingContent message="データ取得中..." />
			) : status === "error" ? (
				<CardContent>
					<Alert variant="destructive" className="mt-4">
						<AlertTitle>エラー</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
					<div className="mt-4">
						<Button asChild>
							<Link href="/">マイページへ</Link>
						</Button>
					</div>
				</CardContent>
			) : status === "success" ? (
				<CardContent>
					<Alert variant="default" className="mt-4">
						<AlertTitle>成功</AlertTitle>
						<AlertDescription>記録されました。</AlertDescription>
					</Alert>
					<div className="mt-4">
						<Button asChild>
							<Link href="/">マイページへ</Link>
						</Button>
					</div>
				</CardContent>
			) : (
				<CardContent className="flex flex-col items-center">
					<p className="mb-4">データを取得できませんでした。</p>
				</CardContent>
			)}
		</Card>
	);
}

export default function EntryPage() {
	return <EntryContent />;
}

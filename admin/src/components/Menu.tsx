"use client";

import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import {
	Calendar,
	CalendarRange,
	History,
	LogIn,
	Mail,
	QrCode,
	UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ユーザーデータの型定義
interface User {
	id: number;
	name: string;
	email: string;
	email_verified_at: string | null;
	created_at: string;
	updated_at: string;
}

// MenuPropsの定義
interface MenuProps {
	onLinkClick?: () => void;
}

export default function Menu({ onLinkClick }: MenuProps) {
	const router = useRouter();
	const { toast } = useToast();

	// 状態管理
	const [adminId, setAdminId] = useState<number | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAdminId = async () => {
			const token = localStorage.getItem("admin-dojo-pass-token");
			if (!token) {
				setLoading(false);
				router.push("/login");
				return;
			}

			try {
				const apiUrl = process.env.NEXT_PUBLIC_API_URL;
				const response = await fetch(`${apiUrl}/api/admin/verify-token`, {
					method: "GET",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					if (response.status === 401 || response.status === 500) {
						// トークンが無効な場合
						throw new Error("認証に失敗しました。再度ログインしてください。");
					}
					throw new Error(
						"データ取得に失敗しました。再度ログインをお試しください。それでも失敗する場合にはお問い合わせください",
					);
				}

				const admin: User = await response.json();
				setAdminId(admin.id);
			} catch (err: any) {
				setError(err.message || "データの取得に失敗しました");
				toast({
					title: "エラー",
					description: "データの取得に失敗しました",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchAdminId();
	}, [router, toast]);

	const isButtonEnabled = adminId !== null && !loading && !error;

	return (
		<div className="menu bg-gray-200 py-4">
			<div className="grid gap-4">
				{/* ログインボタン（常に有効） */}
				<Link
					href="/login"
					className="w-full flex items-center justify-start bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
					onClick={() => {
						onLinkClick?.();
					}}
				>
					<LogIn className="mr-2 h-4 w-4" />
					ログイン
				</Link>

				{/* 会員一覧ボタン */}
				<Link
					href={isButtonEnabled ? "/users" : "#"}
					className={`w-full flex items-center justify-start bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ${
						!isButtonEnabled
							? "opacity-50 cursor-not-allowed pointer-events-none"
							: ""
					}`}
					onClick={() => {
						if (isButtonEnabled) {
							onLinkClick?.();
						}
					}}
				>
					<History className="mr-2 h-4 w-4" />
					会員一覧
				</Link>

				{/* 練習記録用QRコード表示ボタン */}
				<Link
					href={isButtonEnabled ? `/qr?adminId=${adminId}` : "#"}
					className={`w-full flex items-center justify-start bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ${
						!isButtonEnabled
							? "opacity-50 cursor-not-allowed pointer-events-none"
							: ""
					}`}
					onClick={() => {
						if (isButtonEnabled) {
							onLinkClick?.();
						}
					}}
				>
					<QrCode className="mr-2 h-4 w-4" />
					練習記録用QRコード表示
				</Link>

				{/* 会員登録用QRコード表示ボタン */}
				<Link
					href={isButtonEnabled ? `/signup_qr?adminId=${adminId}` : "#"}
					className={`w-full flex items-center justify-start bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ${
						!isButtonEnabled
							? "opacity-50 cursor-not-allowed pointer-events-none"
							: ""
					}`}
					onClick={() => {
						if (isButtonEnabled) {
							onLinkClick?.();
						}
					}}
				>
					<UserPlus className="mr-2 h-4 w-4" />
					会員登録用QRコード表示
				</Link>

				{/* タイムテーブル確認・編集ボタン */}
				<Link
					href={isButtonEnabled ? "/timetable" : "#"}
					className={`w-full flex items-center justify-start bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ${
						!isButtonEnabled
							? "opacity-50 cursor-not-allowed pointer-events-none"
							: ""
					}`}
					onClick={() => {
						if (isButtonEnabled) {
							onLinkClick?.();
						}
					}}
				>
					<Calendar className="mr-2 h-4 w-4" />
					タイムテーブル設定・編集
				</Link>

				{/* イベント出欠管理 */}
				<Link
					href={isButtonEnabled ? "/events" : "#"}
					className={`w-full flex items-center justify-start bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ${
						!isButtonEnabled
							? "opacity-50 cursor-not-allowed pointer-events-none"
							: ""
					}`}
					onClick={() => {
						if (isButtonEnabled) {
							onLinkClick?.();
						}
					}}
				>
					<CalendarRange className="mr-2 h-4 w-4" />
					イベント出欠管理機能
				</Link>

				{/* 会員への連絡ボタン */}
				<Link
					href={isButtonEnabled ? "/contact-members" : "#"}
					className={`w-full flex items-center justify-start bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ${
						!isButtonEnabled
							? "opacity-50 cursor-not-allowed pointer-events-none"
							: ""
					}`}
					onClick={() => {
						if (isButtonEnabled) {
							onLinkClick?.();
						}
					}}
				>
					<Mail className="mr-2 h-4 w-4" />
					会員への連絡
				</Link>
			</div>
			{/* トースト通知を表示するためのToasterコンポーネント */}
			<Toaster />
		</div>
	);
}

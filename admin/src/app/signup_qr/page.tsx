"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { Suspense } from "react";

function QRContent() {
	const searchParams = useSearchParams();
	const adminId = searchParams.get("adminId");

	const userUrl = process.env.NEXT_PUBLIC_USER_URL;
	const qrValue = `${userUrl}/signup?adminId=${adminId}`;

	return (
		<div className="flex justify-center">
			{qrValue ? <QRCodeCanvas value={qrValue} /> : <p>Loading...</p>}
		</div>
	);
}

export default function QRPage() {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<Card className="w-full max-w-md p-6 grid gap-6">
				<div className="grid gap-2">
					<CardTitle>会員登録用QRコード</CardTitle>
					<CardDescription>
						下記QRコードをカメラ等で読み取り、会員登録を行ってください。
					</CardDescription>
				</div>
				<div>
					<Suspense fallback={<p>Loading...</p>}>
						<QRContent />
					</Suspense>
				</div>
				<div className="flex justify-center">
					<Link
						href="#"
						className="text-sm text-primary hover:underline"
						prefetch={false}
					>
						{process.env.NEXT_PUBLIC_USER_URL}
					</Link>
				</div>
			</Card>
		</div>
	);
}

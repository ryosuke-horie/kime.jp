import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "予約完了 | キメ",
	description: "格闘技ジムの予約が完了しました",
};

type Props = {
	params: {};
	searchParams: { [key: string]: string | string[] | undefined };
};

export default function ReservationCompletePage({ searchParams }: Props) {
	const bookingId = typeof searchParams.bookingId === 'string' ? searchParams.bookingId : "unknown";

	return (
		<div className="container mx-auto py-6 px-4 max-w-3xl">
			<Card className="w-full">
				<CardContent className="pt-6 px-6">
					<div className="flex flex-col items-center space-y-4 py-8">
						<CheckCircle2 className="h-16 w-16 text-primary" />
						<h1 className="text-2xl font-bold">予約が完了しました</h1>
						<p className="text-center text-muted-foreground">
							予約内容の確認メールをお送りしましたのでご確認ください。
							<br />
							予約ID: {bookingId}
						</p>
					</div>

					<div className="bg-muted p-4 rounded-lg mb-6">
						<h2 className="font-medium mb-2">【当日のご案内】</h2>
						<ul className="list-disc list-inside space-y-2 text-sm">
							<li>お越しの際は動きやすい服装でお越しください</li>
							<li>水分補給用のドリンクをお持ちください</li>
							<li>タオルのレンタルもございます（有料・200円）</li>
							<li>初回体験の方は、開始10分前にお越しください</li>
						</ul>
					</div>

					<div className="border rounded-lg p-4 mb-6">
						<h2 className="font-medium mb-4">カレンダーに追加</h2>
						<div className="flex flex-wrap gap-2">
							<Button variant="outline" size="sm">
								iCalendarダウンロード
							</Button>
							<Button variant="outline" size="sm">
								Googleカレンダーに追加
							</Button>
						</div>
					</div>

					<div className="border rounded-lg p-4">
						<h2 className="font-medium mb-4">LINE公式アカウントと友達になる</h2>
						<p className="text-sm text-muted-foreground mb-4">
							リマインドやお得な情報をLINEでお届けします
						</p>
						<Button>LINEで友達追加</Button>
					</div>
				</CardContent>
				<CardFooter className="px-6 py-4 flex justify-center">
					<Link href="/">
						<Button variant="ghost">トップページに戻る</Button>
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}

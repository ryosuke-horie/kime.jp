import ReservationWizard from "@/components/reserve/ReservationWizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "予約 | キメ",
	description: "格闘技ジムの体験・クラス予約ページ",
};

export default function ReservePage() {
	return (
		<div className="container mx-auto py-6 px-4 max-w-3xl">
			<h1 className="text-2xl font-bold mb-6">クラス予約</h1>
			<ReservationWizard />
		</div>
	);
}

import Header from "@/components/header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "練習記録サイト",
	description: "練習記録を残すためのサービスです。",
};

export const runtime = "edge";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body className={inter.className}>
				<Header />
				{children}
			</body>
		</html>
	);
}

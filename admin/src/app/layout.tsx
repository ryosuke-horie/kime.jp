import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ResponsiveLayout from "../components/ResponsiveLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "道場パス 管理サイト",
	description: "",
};

// edgeランタイム設定
export const runtime = "edge";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ja">
			<body className={inter.className}>
				<ResponsiveLayout>{children}</ResponsiveLayout>
			</body>
		</html>
	);
}

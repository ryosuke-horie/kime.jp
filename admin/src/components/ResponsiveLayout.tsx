"use client";

import Menu from "@/components/Menu";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ResponsiveLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		// 初回レンダリング時とリサイズ時に画面幅をチェック
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768); // ブレークポイントを必要に応じて調整
		};

		window.addEventListener("resize", handleResize);
		handleResize(); // 初回実行

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div className="flex flex-col md:flex-row bg-gray-100 min-h-screen">
			{isMobile ? (
				<>
					{/* モバイル用メニュー */}
					<MobileMenu />
					{/* メインコンテンツ */}
					<main className="flex-1 p-4">{children}</main>
				</>
			) : (
				<>
					{/* デスクトップ用サイドバー */}
					<aside className="w-70 bg-gray-200 p-4">
						<Menu />
					</aside>
					{/* メインコンテンツ */}
					<main className="flex-1 p-4">{children}</main>
				</>
			)}
		</div>
	);
}

function MobileMenu() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<header className="w-full bg-gray-100 p-4 flex justify-between items-center">
				{/* メニューボタン */}
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					aria-label="メニューを開閉"
					className="focus:outline-none"
				>
					{/* biome-ignore lint/a11y/noSvgWithoutTitle: SVGアイコンに説明的な`aria-label`を使用しているため */}
					<svg
						className="w-6 h-6 text-black"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d={
								isOpen
									? "M6 18L18 6M6 6l12 12" // クロスアイコン
									: "M4 6h16M4 12h16M4 18h16" // ハンバーガーアイコン
							}
						/>
					</svg>
				</button>

				{/* ロゴとタイトルをグループ化 */}
				<div className="flex items-center gap-2">
					<Image src="/logo.jpg" alt="ロゴ" width={100} height={40} />
					<h1 className="text-xl font-bold">管理サイト</h1>
				</div>
			</header>

			{/* メニューが開いている場合 */}
			{isOpen && (
				<div className="fixed inset-0 bg-white z-50 transition-opacity duration-300 ease-in-out">
					<div className="p-4 transition-transform duration-300 ease-in-out">
						{/* メニューコンポーネントにonLinkClickプロップを渡す */}
						<Menu onLinkClick={() => setIsOpen(false)} />
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="mt-4 bg-gray-500 text-white px-4 py-2 rounded focus:outline-none transition-colors duration-300 ease-in-out hover:bg-gray-600"
						>
							閉じる
						</button>
					</div>
				</div>
			)}
		</>
	);
}

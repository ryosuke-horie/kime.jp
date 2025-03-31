"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Calendar, Menu, User } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<header className="flex items-center justify-between bg-background px-4 py-3 shadow-sm md:px-6">
			{/* ロゴ */}
			<Link
				href="/"
				className="flex items-center gap-2 mr-auto"
				prefetch={false}
			>
				<NextImage src="/logo.jpg" alt="ロゴ" width={150} height={50} />
			</Link>

			{/* デスクトップメニュー */}
			<nav className="hidden md:flex items-center gap-6 mr-6">
				<Link href="/" className="flex items-center gap-2 text-sm font-medium">
					<User className="h-4 w-4" />
					マイページ
				</Link>
				<Link
					href="/events"
					className="flex items-center gap-2 text-sm font-medium"
				>
					<Calendar className="h-4 w-4" />
					ジムのイベント一覧
				</Link>
			</nav>

			<Link href="/login" passHref>
				<Button
					variant="default"
					className="px-4 py-2 text-sm font-medium md:inline-flex"
				>
					ログイン
				</Button>
			</Link>

			{/* ハンバーガーメニュー */}
			<div className="flex items-center gap-2">
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon" className="md:hidden">
							<Menu className="h-6 w-6" />
							<span className="sr-only">Toggle menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="right" className="w-[240px] sm:w-[300px]">
						<nav className="flex flex-col gap-4">
							<Link
								href="/"
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-2"
							>
								<User className="h-4 w-4" />
								マイページ
							</Link>
							<Link
								href="/events"
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-2"
							>
								<Calendar className="h-4 w-4" />
								ジムのイベント一覧
							</Link>
						</nav>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}

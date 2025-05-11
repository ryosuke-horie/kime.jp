"use client";

import { SidebarNav } from "@/components/admin/sidebar-nav";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import type { ReactNode } from "react";

interface DashboardLayoutProps {
	children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	const sidebarItems = [
		{
			title: "ダッシュボード",
			href: "/admin/dashboard",
			icon: "dashboard",
		},
		{
			title: "ジム管理",
			href: "/admin/gyms",
			icon: "gym",
		},
		{
			title: "権限設定",
			href: "/admin/permissions",
			icon: "lock",
		},
		{
			title: "レポート・分析",
			href: "/admin/reports",
			icon: "chart",
		},
		{
			title: "設定",
			href: "/admin/settings",
			icon: "settings",
		},
	];

	return (
		<SidebarProvider defaultOpen={true}>
			<div className="flex h-screen overflow-hidden">
				<Sidebar variant="sidebar" collapsible="icon">
					<SidebarHeader className="flex h-14 items-center px-4">
						<div className="flex-1"></div>
						<SidebarTrigger className="fixed top-4 left-4 z-20 h-10 w-10 flex items-center justify-center" />
					</SidebarHeader>
					<SidebarContent className="pt-4">
						<SidebarNav items={sidebarItems} />
					</SidebarContent>
				</Sidebar>
				<div className="flex-1 overflow-auto">
					<div className="container mx-auto py-6">{children}</div>
				</div>
			</div>
		</SidebarProvider>
	);
}

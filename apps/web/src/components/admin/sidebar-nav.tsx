"use client";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
	BarChart3Icon,
	BuildingIcon,
	HomeIcon,
	LockIcon,
	ServerIcon,
	SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface SidebarNavProps {
	items: {
		title: string;
		href: string;
		icon: string;
	}[];
}

export function SidebarNav({ items }: SidebarNavProps) {
	const pathname = usePathname();

	// アイコンのマッピング
	const getIcon = (iconName: string): ReactNode => {
		switch (iconName) {
			case "dashboard":
				return <HomeIcon className="h-5 w-5" />;
			case "gym":
				return <BuildingIcon className="h-5 w-5" />;
			case "lock":
				return <LockIcon className="h-5 w-5" />;
			case "server":
				return <ServerIcon className="h-5 w-5" />;
			case "chart":
				return <BarChart3Icon className="h-5 w-5" />;
			case "settings":
				return <SettingsIcon className="h-5 w-5" />;
			default:
				return <HomeIcon className="h-5 w-5" />;
		}
	};

	return (
		<SidebarMenu>
			{items.map((item) => {
				const isActive = pathname === item.href;
				return (
					<SidebarMenuItem key={item.href}>
						<SidebarMenuButton asChild isActive={isActive} tooltip={item.title} className="px-3 py-2 h-10">
							<Link href={item.href} className="flex items-center gap-3">
								<div className="flex items-center justify-center w-5 h-5">
									{getIcon(item.icon)}
								</div>
								<span className="text-sm">{item.title}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				);
			})}
		</SidebarMenu>
	);
}
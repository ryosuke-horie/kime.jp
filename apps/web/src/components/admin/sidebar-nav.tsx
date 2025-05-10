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
				return <HomeIcon className="h-4 w-4" />;
			case "gym":
				return <BuildingIcon className="h-4 w-4" />;
			case "lock":
				return <LockIcon className="h-4 w-4" />;
			case "server":
				return <ServerIcon className="h-4 w-4" />;
			case "chart":
				return <BarChart3Icon className="h-4 w-4" />;
			case "settings":
				return <SettingsIcon className="h-4 w-4" />;
			default:
				return <HomeIcon className="h-4 w-4" />;
		}
	};

	return (
		<SidebarMenu>
			{items.map((item) => {
				const isActive = pathname === item.href;
				return (
					<SidebarMenuItem key={item.href}>
						<SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
							<Link href={item.href}>
								{getIcon(item.icon)}
								<span>{item.title}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				);
			})}
		</SidebarMenu>
	);
}

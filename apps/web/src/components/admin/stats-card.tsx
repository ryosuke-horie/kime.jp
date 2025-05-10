import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

interface StatsCardProps {
	title: string;
	value: string | number;
	description?: string;
	icon?: ReactNode;
	trend?: {
		value: number;
		isPositive: boolean;
	};
}

export function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
	return (
		<Card className="shadow-sm">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				{icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
				{trend && (
					<div
						className={`flex items-center text-xs mt-1 ${
							trend.isPositive ? "text-green-500" : "text-red-500"
						}`}
					>
						{trend.isPositive ? "↑" : "↓"} {trend.value}%
					</div>
				)}
			</CardContent>
		</Card>
	);
}

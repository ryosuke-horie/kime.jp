"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { GymType } from "@/types/gym";

interface DeleteGymDialogProps {
	gym: GymType | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (gym: GymType) => Promise<void>;
	isDeleting: boolean;
}

export function DeleteGymDialog({
	gym,
	open,
	onOpenChange,
	onConfirm,
	isDeleting = false,
}: DeleteGymDialogProps) {
	if (!gym) return null;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>ジムの削除</AlertDialogTitle>
					<AlertDialogDescription>
						<p>
							「<strong>{gym.name}</strong>」を削除してもよろしいですか？
						</p>
						<p className="mt-2 text-muted-foreground">
							この操作は取り消せません。関連するすべてのデータが削除されます。
						</p>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							if (gym) {
								onConfirm(gym);
							}
						}}
						disabled={isDeleting}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isDeleting ? "削除中..." : "削除する"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

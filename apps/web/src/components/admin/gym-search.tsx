import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type React from "react";
import { useState } from "react";

interface GymSearchProps {
	onSearch: (filters: { name: string }) => void;
}

export function GymSearch({ onSearch }: GymSearchProps) {
	const [name, setName] = useState("");

	// 検索フィルターの変更を処理
	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setName(value);
		onSearch({ name: value });
	};

	// フィルターをリセット
	const handleReset = () => {
		setName("");
		onSearch({ name: "" });
	};

	return (
		<div className="mb-6 grid gap-4 md:grid-cols-3">
			<div className="grid gap-2 md:col-span-2">
				<Label htmlFor="name">ジム名検索</Label>
				<Input id="name" placeholder="ジム名で検索" value={name} onChange={handleNameChange} />
			</div>
			<div className="flex items-end">
				<button
					onClick={handleReset}
					className="text-sm text-muted-foreground hover:text-foreground"
				>
					フィルターをリセット
				</button>
			</div>
		</div>
	);
}

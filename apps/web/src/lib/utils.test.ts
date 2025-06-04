/**
 * ユーティリティ関数のテスト
 */
import { cn } from "./utils";

describe("cn関数", () => {
	test("複数のクラス名を結合できる", () => {
		const result = cn("btn", "btn-primary", "text-white");
		expect(result).toContain("btn");
		expect(result).toContain("btn-primary");
		expect(result).toContain("text-white");
	});

	test("条件付きクラス名を処理できる", () => {
		const isActive = true;
		const result = cn("btn", isActive && "active", !isActive && "inactive");
		expect(result).toContain("btn");
		expect(result).toContain("active");
		expect(result).not.toContain("inactive");
	});

	test("Tailwind CSS の競合するクラスを適切にマージする", () => {
		const result = cn("px-2", "px-4");
		// twMergeにより、後のpx-4が優先される
		expect(result).toContain("px-4");
		expect(result).not.toContain("px-2");
	});

	test("空の値やundefinedを適切に処理する", () => {
		const result = cn("btn", "", undefined, null, "active");
		expect(result).toContain("btn");
		expect(result).toContain("active");
	});

	test("引数なしの場合は空文字を返す", () => {
		const result = cn();
		expect(result).toBe("");
	});
});

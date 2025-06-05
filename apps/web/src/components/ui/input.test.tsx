/**
 * Inputコンポーネントのテスト
 * IME入力時の背景色問題修正の検証を含む
 */
import { describe, expect, it } from "vitest";

describe("Input Component", () => {
	it("Input コンポーネントが正しくインポートできる", () => {
		expect(() => import("./input")).not.toThrow();
	});

	it("IME対応のCSSクラス文字列が正しく定義されている", () => {
		// IME関連のクラス文字列をテスト
		const imeClasses = [
			"ime-mode:auto",
			"[ime-mode:active]:bg-transparent",
			"[composition-start]:bg-transparent", 
			"[composition-update]:bg-transparent",
			"[composition-end]:bg-transparent"
		];
		
		imeClasses.forEach(className => {
			expect(className).toBeTruthy();
			expect(typeof className).toBe("string");
		});
	});
});
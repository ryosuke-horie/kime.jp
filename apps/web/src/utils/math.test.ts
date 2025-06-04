/**
 * 基本的な環境動作確認テスト
 */
import { describe, expect, it } from "vitest";

function add(a: number, b: number): number {
	return a + b;
}

describe("Math Utils", () => {
	it("足し算が正しく動作する", () => {
		expect(add(2, 3)).toBe(5);
		expect(add(-1, 1)).toBe(0);
		expect(add(0, 0)).toBe(0);
	});

	it("TypeScriptとVitestの型推論が動作する", () => {
		const result: number = add(1, 2);
		expect(typeof result).toBe("number");
	});
});

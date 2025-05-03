import { describe, it, expect } from "vitest";

describe("基本テスト", () => {
	it("trueはtrueであるべき", () => {
		expect(true).toBe(true);
	});

	it("1 + 1は2であるべき", () => {
		expect(1 + 1).toBe(2);
	});
});
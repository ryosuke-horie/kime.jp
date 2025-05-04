// vitestのglobalsを使用するため、明示的なインポートは不要
// tsconfig.jsonに"types": ["vitest/globals"]を追加済み

describe("基本テスト", () => {
	it("trueはtrueであるべき", () => {
		expect(true).toBe(true);
	});

	it("1 + 1は2であるべき", () => {
		expect(1 + 1).toBe(2);
	});
});

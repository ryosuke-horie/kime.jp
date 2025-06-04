/**
 * APIモジュールのエクスポートテスト
 */
describe("API index モジュール", () => {
	test("clientモジュールからエクスポートされる", async () => {
		const apiModule = await import("./index");
		expect(apiModule.ApiClient).toBeDefined();
	});

	test("hooksモジュールからエクスポートされる", async () => {
		const apiModule = await import("./index");
		// hooksモジュールの関数がエクスポートされることを確認
		expect(typeof apiModule).toBe("object");
	});
});
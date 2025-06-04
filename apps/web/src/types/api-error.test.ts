/**
 * API エラー型のテスト
 */
import { asApiError, isApiError } from "./api-error";

describe("API エラー型", () => {
	test("asApiError関数が正しくApiErrorを返す", () => {
		const error = new Error("Test error");
		const apiError = asApiError(error);

		expect(apiError).toBeDefined();
		expect(apiError.message).toBe("Test error");
	});

	test("asApiError関数がError型のオブジェクトを処理する", () => {
		const error = new Error("Custom error");
		error.stack = "test stack";
		const apiError = asApiError(error);

		expect(apiError).toBeDefined();
		expect(apiError.message).toBe("Custom error");
		expect(apiError.stack).toBe("test stack");
	});

	test("isApiError型ガードが正しく動作する", () => {
		// statusプロパティを持つError
		const apiError = new Error("API error");
		(apiError as any).status = 404;

		// 通常のError
		const normalError = new Error("Normal error");

		expect(isApiError(apiError)).toBe(true);
		expect(isApiError(normalError)).toBe(false);
		expect(isApiError("string")).toBe(false);
		expect(isApiError(null)).toBe(false);
	});

	test("ApiErrorインターフェースが追加プロパティを持てる", () => {
		const error = new Error("API Error");
		const apiError = asApiError(error);

		// 追加プロパティを設定
		apiError.status = 500;
		apiError.data = { code: "INTERNAL_ERROR" };

		expect(apiError.status).toBe(500);
		expect(apiError.data).toEqual({ code: "INTERNAL_ERROR" });
	});
});

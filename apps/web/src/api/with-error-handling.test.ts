/**
 * エラーハンドリング高階関数のテスト
 */
import { withErrorHandling } from "./with-error-handling";
import { handleError } from "@/components/ui/error-handler";
import { vi } from "vitest";

// error-handlerをモック
vi.mock("@/components/ui/error-handler", () => ({
	handleError: vi.fn(),
}));

const mockedHandleError = handleError as any;

describe("withErrorHandling", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("成功時は元の関数の結果をそのまま返す", async () => {
		const mockApiFn = vi.fn().mockResolvedValue({ data: "success" });
		const wrappedFn = withErrorHandling(mockApiFn);

		const result = await wrappedFn("arg1", "arg2");

		expect(result).toEqual({ data: "success" });
		expect(mockApiFn).toHaveBeenCalledWith("arg1", "arg2");
		expect(mockedHandleError).not.toHaveBeenCalled();
	});

	test("エラー時はhandleErrorを呼び出し、エラーを再スローする", async () => {
		const error = new Error("API Error");
		const mockApiFn = vi.fn().mockRejectedValue(error);
		const wrappedFn = withErrorHandling(mockApiFn, "カスタムエラーメッセージ");

		await expect(wrappedFn("arg1")).rejects.toThrow("API Error");

		expect(mockApiFn).toHaveBeenCalledWith("arg1");
		expect(mockedHandleError).toHaveBeenCalledWith(error, "カスタムエラーメッセージ");
	});

	test("エラーメッセージが省略された場合でも正常に動作する", async () => {
		const error = new Error("API Error");
		const mockApiFn = vi.fn().mockRejectedValue(error);
		const wrappedFn = withErrorHandling(mockApiFn);

		await expect(wrappedFn()).rejects.toThrow("API Error");

		expect(mockedHandleError).toHaveBeenCalledWith(error, undefined);
	});

	test("複数の引数を持つ関数でも正常に動作する", async () => {
		const mockApiFn = vi.fn().mockResolvedValue("result");
		const wrappedFn = withErrorHandling(mockApiFn);

		const result = await wrappedFn(1, "test", { key: "value" }, [1, 2, 3]);

		expect(result).toBe("result");
		expect(mockApiFn).toHaveBeenCalledWith(1, "test", { key: "value" }, [1, 2, 3]);
	});

	test("型推論が正しく動作する", async () => {
		// 型チェックのためのテスト
		const stringApiFn = async (str: string): Promise<string> => str.toUpperCase();
		const numberApiFn = async (num: number): Promise<number> => num * 2;

		const wrappedStringFn = withErrorHandling(stringApiFn);
		const wrappedNumberFn = withErrorHandling(numberApiFn);

		const stringResult = await wrappedStringFn("hello");
		const numberResult = await wrappedNumberFn(5);

		expect(stringResult).toBe("HELLO");
		expect(numberResult).toBe(10);
	});
});
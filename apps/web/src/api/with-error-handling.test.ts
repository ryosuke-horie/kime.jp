import { handleError } from "@/components/ui/error-handler";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { withErrorHandling } from "./with-error-handling";

// エラーハンドラーをモック
vi.mock("@/components/ui/error-handler", () => ({
	handleError: vi.fn(),
}));

describe("withErrorHandling", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("成功時は元の関数を実行してその結果を返す", async () => {
		const mockFn = vi.fn().mockResolvedValue("success");
		const wrappedFn = withErrorHandling(mockFn, "エラーメッセージ");

		const result = await wrappedFn("arg1", "arg2");

		expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
		expect(result).toBe("success");
		expect(handleError).not.toHaveBeenCalled();
	});

	it("エラー発生時はエラーハンドラーを呼び出し、エラーを再スローする", async () => {
		const testError = new Error("テストエラー");
		const mockFn = vi.fn().mockRejectedValue(testError);
		const wrappedFn = withErrorHandling(mockFn, "エラーメッセージ");

		await expect(wrappedFn()).rejects.toThrow(testError);
		expect(handleError).toHaveBeenCalledWith(testError, "エラーメッセージ");
	});

	it("カスタムエラーメッセージをハンドラーに渡す", async () => {
		const testError = new Error("テストエラー");
		const mockFn = vi.fn().mockRejectedValue(testError);
		const customMessage = "カスタムエラーメッセージ";
		const wrappedFn = withErrorHandling(mockFn, customMessage);

		await expect(wrappedFn()).rejects.toThrow(testError);
		expect(handleError).toHaveBeenCalledWith(testError, customMessage);
	});

	it("エラーメッセージを指定しない場合も動作する", async () => {
		const testError = new Error("テストエラー");
		const mockFn = vi.fn().mockRejectedValue(testError);
		const wrappedFn = withErrorHandling(mockFn); // エラーメッセージなし

		await expect(wrappedFn()).rejects.toThrow(testError);
		expect(handleError).toHaveBeenCalledWith(testError, undefined);
	});
});

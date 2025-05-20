import type { Context } from "hono";
import { describe, expect, it, vi } from "vitest";
import { BadRequestError, NotFoundError, ServerError } from "../utils/errors";
import { errorHandler } from "./error-handler";

describe("errorHandlerミドルウェア", () => {
	it("BadRequestErrorを適切に処理する", async () => {
		const mockError = new BadRequestError("不正なデータ", { field: "name" });
		const mockNext = vi.fn().mockRejectedValue(mockError);

		const jsonMock = vi.fn();
		const mockContext = {
			json: jsonMock,
		} as unknown as Context;

		await errorHandler(mockContext, mockNext);

		expect(mockNext).toHaveBeenCalled();
		expect(jsonMock).toHaveBeenCalledWith(
			{ error: "不正なデータ", details: { field: "name" } },
			{ status: 400 },
		);
	});

	it("NotFoundErrorを適切に処理する", async () => {
		const mockError = new NotFoundError("リソースが見つかりません");
		const mockNext = vi.fn().mockRejectedValue(mockError);

		const jsonMock = vi.fn();
		const mockContext = {
			json: jsonMock,
		} as unknown as Context;

		await errorHandler(mockContext, mockNext);

		expect(mockNext).toHaveBeenCalled();
		expect(jsonMock).toHaveBeenCalledWith({ error: "リソースが見つかりません" }, { status: 404 });
	});

	it("ServerErrorを適切に処理する", async () => {
		const mockError = new ServerError("サーバーエラーが発生しました");
		const mockNext = vi.fn().mockRejectedValue(mockError);

		const jsonMock = vi.fn();
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const mockContext = {
			json: jsonMock,
		} as unknown as Context;

		await errorHandler(mockContext, mockNext);

		expect(mockNext).toHaveBeenCalled();
		expect(consoleSpy).toHaveBeenCalled();
		expect(jsonMock).toHaveBeenCalledWith(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 },
		);
	});

	it("一般的なErrorを500エラーとして処理する", async () => {
		const mockError = new Error("一般的なエラー");
		const mockNext = vi.fn().mockRejectedValue(mockError);

		const jsonMock = vi.fn();
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const mockContext = {
			json: jsonMock,
		} as unknown as Context;

		await errorHandler(mockContext, mockNext);

		expect(mockNext).toHaveBeenCalled();
		expect(consoleSpy).toHaveBeenCalled();
		expect(jsonMock).toHaveBeenCalledWith({ error: "一般的なエラー" }, { status: 500 });
	});

	it("エラーがない場合は次のミドルウェアを実行する", async () => {
		const mockNext = vi.fn().mockResolvedValue(undefined);
		const jsonMock = vi.fn();
		const mockContext = {
			json: jsonMock,
		} as unknown as Context;

		await errorHandler(mockContext, mockNext);

		expect(mockNext).toHaveBeenCalled();
		expect(jsonMock).not.toHaveBeenCalled();
	});
});

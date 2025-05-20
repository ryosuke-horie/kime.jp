import { describe, expect, it } from "vitest";
import {
	AppError,
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
	ServerError,
	UnauthorizedError,
	formatError,
} from "./errors";

describe("エラークラス", () => {
	it("AppErrorは基本的なエラー情報を保持する", () => {
		const error = new AppError("テストエラー", 500);
		expect(error.message).toBe("テストエラー");
		expect(error.status).toBe(500);
		expect(error.details).toBeUndefined();
	});

	it("AppErrorは詳細情報を保持できる", () => {
		const details = { field: "name", issue: "required" };
		const error = new AppError("テストエラー", 400, details);
		expect(error.message).toBe("テストエラー");
		expect(error.status).toBe(400);
		expect(error.details).toEqual(details);
	});

	it("BadRequestErrorは400ステータスコードを持つ", () => {
		const error = new BadRequestError("無効なリクエスト");
		expect(error.message).toBe("無効なリクエスト");
		expect(error.status).toBe(400);
	});

	it("NotFoundErrorは404ステータスコードを持つ", () => {
		const error = new NotFoundError("リソースが見つかりません");
		expect(error.message).toBe("リソースが見つかりません");
		expect(error.status).toBe(404);
	});

	it("UnauthorizedErrorは401ステータスコードを持つ", () => {
		const error = new UnauthorizedError("認証が必要です");
		expect(error.message).toBe("認証が必要です");
		expect(error.status).toBe(401);
	});

	it("ForbiddenErrorは403ステータスコードを持つ", () => {
		const error = new ForbiddenError("アクセス権限がありません");
		expect(error.message).toBe("アクセス権限がありません");
		expect(error.status).toBe(403);
	});

	it("ConflictErrorは409ステータスコードを持つ", () => {
		const error = new ConflictError("リソースが競合しています");
		expect(error.message).toBe("リソースが競合しています");
		expect(error.status).toBe(409);
	});

	it("ServerErrorは500ステータスコードを持つ", () => {
		const error = new ServerError("サーバーエラーが発生しました");
		expect(error.message).toBe("サーバーエラーが発生しました");
		expect(error.status).toBe(500);
	});
});

describe("formatError関数", () => {
	it("AppErrorを適切なJSONレスポンスに変換する", () => {
		const error = new BadRequestError("無効なデータ", { field: "name", issue: "required" });
		const formatted = formatError(error);

		expect(formatted).toEqual({
			error: "無効なデータ",
			details: { field: "name", issue: "required" },
			status: 400,
		});
	});

	it("通常のErrorをServerError扱いに変換する", () => {
		const error = new Error("一般的なエラー");
		const formatted = formatError(error);

		expect(formatted).toEqual({
			error: "一般的なエラー",
			status: 500,
		});
	});

	it("文字列をServerError扱いに変換する", () => {
		const errorMessage = "エラーメッセージ";
		const formatted = formatError(errorMessage);

		expect(formatted).toEqual({
			error: "エラーメッセージ",
			status: 500,
		});
	});
});

import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { registry } from "./openapi/config";

// zodをOpenAPI拡張
extendZodWithOpenApi(z);

// 共通のエラーレスポンス型
export const ErrorResponse = z.object({
	error: z.string().describe("エラーメッセージ"),
});

// OpenAPIスキーマに登録
registry.register("ErrorResponse", ErrorResponse);

export type ErrorResponseType = z.infer<typeof ErrorResponse>;

// 成功レスポンスの基本型
export const SuccessResponse = z.object({
	message: z.string().describe("成功メッセージ"),
});

// OpenAPIスキーマに登録
registry.register("SuccessResponse", SuccessResponse);

export type SuccessResponseType = z.infer<typeof SuccessResponse>;

// UUIDの型（例：ジムID、会員ID、クラスIDなど）
export const UUID = z.string().uuid().describe("UUIDフォーマットの識別子");

export type UUIDType = z.infer<typeof UUID>;

// ISODateTimeの型
export const ISODateTime = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/)
	.describe("ISO 8601形式の日時");

export type ISODateTimeType = z.infer<typeof ISODateTime>;

// ページネーションパラメータ
export const PaginationParams = z.object({
	page: z
		.number()
		.int()
		.min(1)
		.optional()
		.default(1)
		.describe("ページ番号（1始まり）"),
	limit: z
		.number()
		.int()
		.min(1)
		.max(100)
		.optional()
		.default(20)
		.describe("1ページあたりの件数"),
});

// OpenAPIスキーマに登録
registry.register("PaginationParams", PaginationParams);

export type PaginationParamsType = z.infer<typeof PaginationParams>;

// ページネーション結果のメタデータ
export const PaginationMeta = z.object({
	total: z.number().int().describe("全件数"),
	page: z.number().int().describe("現在のページ番号"),
	limit: z.number().int().describe("1ページあたりの件数"),
	totalPages: z.number().int().describe("総ページ数"),
});

// OpenAPIスキーマに登録
registry.register("PaginationMeta", PaginationMeta);

export type PaginationMetaType = z.infer<typeof PaginationMeta>;

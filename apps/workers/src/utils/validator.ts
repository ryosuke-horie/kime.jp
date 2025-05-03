import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { z } from "zod";
import type { Env } from "../env";

/**
 * リクエストボディのバリデーションを行うミドルウェアを生成
 * @param schema バリデーション用Zodスキーマ
 * @returns Honoミドルウェア
 */
export const validateBody = <T extends z.ZodTypeAny>(schema: T) =>
	zValidator("json", schema, (result, c) => {
		if (!result.success) {
			return c.json(
				{
					error: "バリデーションエラー",
					details: result.error.issues.map((issue) => ({
						path: issue.path.join("."),
						message: issue.message,
					})),
				},
				400,
			);
		}
	});

/**
 * クエリパラメータのバリデーションを行うミドルウェアを生成
 * @param schema バリデーション用Zodスキーマ
 * @returns Honoミドルウェア
 */
export const validateQuery = <T extends z.ZodTypeAny>(schema: T) =>
	zValidator("query", schema, (result, c) => {
		if (!result.success) {
			return c.json(
				{
					error: "クエリパラメータが不正です",
					details: result.error.issues.map((issue) => ({
						path: issue.path.join("."),
						message: issue.message,
					})),
				},
				400,
			);
		}
	});

/**
 * パスパラメータのバリデーションを行うミドルウェアを生成
 * @param schema バリデーション用Zodスキーマ
 * @returns Honoミドルウェア
 */
export const validateParam = <T extends z.ZodTypeAny>(schema: T) =>
	zValidator("param", schema, (result, c) => {
		if (!result.success) {
			return c.json(
				{
					error: "パスパラメータが不正です",
					details: result.error.issues.map((issue) => ({
						path: issue.path.join("."),
						message: issue.message,
					})),
				},
				400,
			);
		}
	});

/**
 * レスポンス用のJSONデータをスキーマに基づいてバリデーションしてから返す
 * @param c Honoコンテキスト
 * @param schema バリデーション用Zodスキーマ
 * @param data レスポンスデータ
 * @param status HTTPステータスコード
 * @returns JSONレスポンス
 */
export function validatedJson<T extends z.ZodTypeAny>(
	c: Context<{ Bindings: Env }>,
	schema: T,
	data: z.infer<T>,
	status = 200,
) {
	// 開発環境の場合はレスポンスのバリデーションを実行
	if (process.env.NODE_ENV !== "production") {
		const result = schema.safeParse(data);
		if (!result.success) {
			console.error("Response validation failed:", result.error.issues);
			return c.json(
				{
					error: "レスポンスバリデーションエラー（開発環境のみ）",
					details: result.error.issues.map((issue) => ({
						path: issue.path.join("."),
						message: issue.message,
					})),
				},
				500,
			);
		}
	}

	return c.json(data, status);
}

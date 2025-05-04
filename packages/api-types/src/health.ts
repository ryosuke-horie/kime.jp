import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { ErrorResponse } from "./common";
import { registry } from "./openapi/config";

// zodをOpenAPI拡張
extendZodWithOpenApi(z);

// ヘルスチェックレスポンススキーマ
export const HealthCheckResponse = z.object({
	status: z.enum(["ok", "error"]).describe("サービスの状態"),
	timestamp: z.string().describe("ヘルスチェックの実行時刻"),
	version: z.string().describe("APIのバージョン"),
});

// OpenAPIスキーマに登録
registry.register("HealthCheckResponse", HealthCheckResponse);

export type HealthCheckResponseType = z.infer<typeof HealthCheckResponse>;

// ヘルスチェックエンドポイントの定義
registry.registerPath({
	method: "get",
	path: "/health",
	tags: ["health"],
	summary: "APIのヘルスチェック",
	description: "APIサーバーの状態を確認します",
	responses: {
		200: {
			description: "APIサーバーが正常動作中",
			content: {
				"application/json": {
					schema: HealthCheckResponse,
				},
			},
		},
		500: {
			description: "サーバーエラー",
			content: {
				"application/json": {
					schema: ErrorResponse,
				},
			},
		},
	},
});

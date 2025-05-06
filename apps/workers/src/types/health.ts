import { z } from "zod";
import { registry } from "./registry-mock";

// サービスの状態を表すスキーマ
export const ServiceStatus = z.object({
	status: z.enum(["ok", "error"]).describe("サービスの状態"),
	message: z.string().optional().describe("状態に関する追加メッセージ"),
	latency: z.number().optional().describe("応答時間（ミリ秒）"),
});

export type ServiceStatusType = z.infer<typeof ServiceStatus>;

// ヘルスチェックレスポンススキーマ
export const HealthCheckResponse = z.object({
	status: z.enum(["ok", "error", "degraded"]).describe("システム全体の状態"),
	timestamp: z.string().describe("ヘルスチェックの実行時刻"),
	version: z.string().describe("APIのバージョン"),
	services: z.object({
		api: ServiceStatus.describe("APIサービスの状態"),
		database: ServiceStatus.optional().describe("データベース接続の状態"),
	}).describe("各サービスの状態"),
});

// OpenAPIスキーマに登録
registry.register("HealthCheckResponse", HealthCheckResponse);

export type HealthCheckResponseType = z.infer<typeof HealthCheckResponse>;

// 拡張ヘルスチェックレスポンススキーマ
export const ExtendedHealthCheckResponse = HealthCheckResponse.extend({
	database_details: z.object({
		connection_established: z.boolean().describe("データベース接続が確立されているか"),
		query_executed: z.boolean().optional().describe("クエリが実行されたか"),
		query_result: z.any().optional().describe("クエリの結果"),
	}).optional().describe("データベース接続の詳細情報"),
});

export type ExtendedHealthCheckResponseType = z.infer<typeof ExtendedHealthCheckResponse>;

// ヘルスチェックエンドポイントの定義
registry.registerPath({
	method: "get",
	path: "/health",
	tags: ["health"],
	summary: "APIのヘルスチェック",
	description: "APIサーバーと関連サービスの状態を確認します",
	responses: {
		200: {
			description: "システムが正常に動作中",
			content: {
				"application/json": {
					schema: HealthCheckResponse,
				},
			},
		},
		207: {
			description: "一部のサービスに問題があります",
			content: {
				"application/json": {
					schema: HealthCheckResponse,
				},
			},
		},
		500: {
			description: "システム全体で重大なエラーが発生しています",
			content: {
				"application/json": {
					schema: {
						type: "object",
						properties: {
							error: { type: "string" },
							timestamp: { type: "string" },
						},
						required: ["error", "timestamp"],
					},
				},
			},
		},
	},
});

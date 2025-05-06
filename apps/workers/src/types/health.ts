import { z } from "zod";

// ヘルスチェックレスポンススキーマ
export const HealthCheckResponse = z.object({
	status: z.enum(["ok", "error"]).describe("サービスの状態"),
	timestamp: z.string().describe("ヘルスチェックの実行時刻"),
	version: z.string().describe("APIのバージョン"),
});


export type HealthCheckResponseType = z.infer<typeof HealthCheckResponse>;


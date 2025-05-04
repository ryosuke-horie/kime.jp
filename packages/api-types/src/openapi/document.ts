// OpenAPIの構成を定義するだけのスタブファイル
// テスト環境での互換性のために残す
import { apiInfo, securitySchemes, servers, tags } from "./config";

// 暫定的なOpenAPIドキュメント
// 実際の生成は必要に応じて後で実装
export const openApiDocument = {
	openapi: "3.0.0",
	info: apiInfo,
	servers,
	paths: {},
	components: {
		schemas: {},
		securitySchemes,
	},
	security: [{ apiKey: [] }],
	tags,
};

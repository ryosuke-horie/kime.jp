// CommonJS環境との互換性のために型情報をエクスポート
// ここでは重複してextendZodWithOpenApiを行わない

// 共通型
export * from "./common";

// ヘルスチェック
export * from "./health";

// ジム関連
export * from "./gym";

// API URL設定
export const API_BASE_URL = {
	production: "https://api.kime.jp",
	staging: "https://api-staging.kime.jp",
	development: "http://localhost:8787",
};

// OpenAPI関連
export * from "./openapi/config";
export * from "./openapi/document";

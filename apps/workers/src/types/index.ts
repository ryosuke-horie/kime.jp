import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Zodを拡張して、OpenAPIメタデータ追加メソッドを提供
extendZodWithOpenApi(z);

// 共通型
export * from "./common";

// ヘルスチェック
export * from "./health";

// ジム関連
export * from "./gym";

// 認証関連
export * from "./auth";

// API URL設定
export const API_BASE_URL = {
	production: "https://api.kime.jp",
	staging: "https://api-staging.kime.jp",
	development: "http://localhost:8787",
};

// OpenAPI関連
export * from "./openapi/config";
export * from "./openapi/document";

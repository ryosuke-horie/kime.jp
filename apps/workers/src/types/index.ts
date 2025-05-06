import { z } from "zod";

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

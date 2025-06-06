// 共通型
export * from "./common";

// ヘルスチェック
export * from "./health";

// ジム関連
export * from "./gym";

// スタッフ関連
export * from "./staff";

// API URL設定
export const API_BASE_URL = {
	production: "https://api.kime.jp",
	staging: "https://api-staging.kime.jp",
	development: "http://localhost:8787",
};

// API型定義を直接参照
// @kime/api-typesパッケージのエクスポートは循環依存のため直接インポートできない場合がある
// 必要に応じて個別にインポートする形式に修正
// 例: export * from "@kime/api-types/dist/gym";

// 一時的なスタブ定義
// CIを通すための最小限の定義
export const API_BASE_URL = {
	production: "https://api.kime.jp",
	staging: "https://api-staging.kime.jp",
	development: "http://localhost:8787",
};

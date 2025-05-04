import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

// OpenAPIのレジストリを作成
export const registry = new OpenAPIRegistry();

// API情報の共通設定
export const apiInfo = {
	title: "Kime API",
	version: "1.0.0",
	description: "格闘技ジム向けAI予約・フォローアップシステムのAPI",
	contact: {
		name: "Kime Team",
		url: "https://github.com/ryosuke-horie/kime.jp",
	},
	license: {
		name: "Private",
	},
};

// OpenAPIのセキュリティスキーマを定義
export const securitySchemes = {
	apiKey: {
		type: "apiKey",
		name: "X-API-Key",
		in: "header",
	},
};

// 環境別APIサーバー設定
export const servers = [
	{
		url: "https://api.kime.jp",
		description: "本番環境",
	},
	{
		url: "https://api-staging.kime.jp",
		description: "ステージング環境",
	},
	{
		url: "http://localhost:8787",
		description: "開発環境",
	},
];

// タグ（APIのグループ）定義
export const tags = [
	{
		name: "health",
		description: "ヘルスチェック関連のエンドポイント",
	},
	{
		name: "gyms",
		description: "ジム関連のエンドポイント",
	},
	{
		name: "members",
		description: "会員関連のエンドポイント",
	},
	{
		name: "classes",
		description: "クラス関連のエンドポイント",
	},
	{
		name: "bookings",
		description: "予約関連のエンドポイント",
	},
];

// 標準的なレスポンスパターン
export const standardResponses = {
	unauthorized: {
		description: "認証エラー",
		content: {
			"application/json": {
				schema: {
					type: "object",
					properties: {
						error: { type: "string" },
					},
				},
			},
		},
	},
	forbidden: {
		description: "権限エラー",
		content: {
			"application/json": {
				schema: {
					type: "object",
					properties: {
						error: { type: "string" },
					},
				},
			},
		},
	},
	notFound: {
		description: "リソースが見つかりません",
		content: {
			"application/json": {
				schema: {
					type: "object",
					properties: {
						error: { type: "string" },
					},
				},
			},
		},
	},
	serverError: {
		description: "サーバーエラー",
		content: {
			"application/json": {
				schema: {
					type: "object",
					properties: {
						error: { type: "string" },
					},
				},
			},
		},
	},
};

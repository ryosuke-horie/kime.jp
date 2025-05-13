// @ts-nocheck

import { z } from "zod";
import { ISODateTime, PaginationMeta, UUID } from "./common";
import { registry } from "./openapi/config";

// ジムの基本モデル
export const Gym = z.object({
	gymId: UUID.describe("ジムの一意識別子"),
	name: z.string().min(1).max(100).describe("ジム名"),
	ownerEmail: z.string().email().describe("オーナーのメールアドレス"),
	createdAt: ISODateTime.describe("作成日時"),
	updatedAt: ISODateTime.describe("更新日時"),
});

// OpenAPIスキーマに登録
registry.register("Gym", Gym);

export type GymType = z.infer<typeof Gym>;

// ジム作成リクエスト
export const CreateGymRequest = z.object({
	name: z.string().min(1).max(100).describe("ジム名"),
	ownerEmail: z.string().email().describe("オーナーのメールアドレス"),
});

// OpenAPIスキーマに登録
registry.register("CreateGymRequest", CreateGymRequest);

export type CreateGymRequestType = z.infer<typeof CreateGymRequest>;

// ジム作成レスポンス
export const CreateGymResponse = z.object({
	message: z.string().describe("成功メッセージ"),
	gymId: UUID.describe("作成されたジムのID"),
});

// OpenAPIスキーマに登録
registry.register("CreateGymResponse", CreateGymResponse);

export type CreateGymResponseType = z.infer<typeof CreateGymResponse>;

// ジム更新リクエスト
export const UpdateGymRequest = z.object({
	name: z.string().min(1).max(100).optional().describe("ジム名"),
	ownerEmail: z.string().email().optional().describe("オーナーのメールアドレス"),
});

// OpenAPIスキーマに登録
registry.register("UpdateGymRequest", UpdateGymRequest);

export type UpdateGymRequestType = z.infer<typeof UpdateGymRequest>;

// ジム一覧レスポンス
export const GymListResponse = z.object({
	gyms: z.array(Gym).describe("ジム一覧"),
	meta: PaginationMeta.optional().describe("ページネーション情報"),
});

// OpenAPIスキーマに登録
registry.register("GymListResponse", GymListResponse);

export type GymListResponseType = z.infer<typeof GymListResponse>;

// ジム詳細レスポンス
export const GymDetailResponse = z.object({
	gym: Gym.describe("ジム情報"),
});

// OpenAPIスキーマに登録
registry.register("GymDetailResponse", GymDetailResponse);

export type GymDetailResponseType = z.infer<typeof GymDetailResponse>;

// ジム一覧取得エンドポイント（管理者用）
registry.registerPath({
	method: "get",
	path: "/api/gyms/admin",
	tags: ["gyms"],
	summary: "ジム一覧取得（管理者用）",
	description: "全ジムの一覧を取得します（管理者権限が必要）",
	security: [{ apiKey: [] }],
	parameters: [
		{
			name: "page",
			in: "query",
			schema: { type: "integer", default: 1, minimum: 1 },
			description: "ページ番号",
			required: false,
		},
		{
			name: "limit",
			in: "query",
			schema: { type: "integer", default: 20, minimum: 1, maximum: 100 },
			description: "1ページの件数",
			required: false,
		},
	],
	responses: {
		200: {
			description: "ジム一覧の取得成功",
			content: {
				"application/json": {
					schema: registry.getRef("GymListResponse"),
				},
			},
		},
		401: {
			description: "認証エラー",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
		403: {
			description: "権限エラー",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
		500: {
			description: "サーバーエラー",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
	},
});

// ジム登録エンドポイント（管理者用）
registry.registerPath({
	method: "post",
	path: "/api/gyms/admin",
	tags: ["gyms"],
	summary: "ジム登録（管理者用）",
	description: "新しいジムを登録します（管理者権限が必要）",
	security: [{ apiKey: [] }],
	requestBody: {
		description: "ジム情報",
		content: {
			"application/json": {
				schema: registry.getRef("CreateGymRequest"),
			},
		},
		required: true,
	},
	responses: {
		201: {
			description: "ジム登録成功",
			content: {
				"application/json": {
					schema: registry.getRef("CreateGymResponse"),
				},
			},
		},
		400: {
			description: "入力エラー",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
		401: {
			description: "認証エラー",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
		403: {
			description: "権限エラー",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
		500: {
			description: "サーバーエラー",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
	},
});

// ジム詳細取得エンドポイント
registry.registerPath({
	method: "get",
	path: "/api/gyms/{gymId}",
	tags: ["gyms"],
	summary: "ジム詳細取得",
	description: "指定されたIDのジム詳細を取得します",
	parameters: [
		{
			name: "gymId",
			in: "path",
			schema: { type: "string", format: "uuid" },
			description: "ジムID",
			required: true,
		},
	],
	responses: {
		200: {
			description: "ジム詳細の取得成功",
			content: {
				"application/json": {
					schema: registry.getRef("GymDetailResponse"),
				},
			},
		},
		404: {
			description: "ジムが見つかりません",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
		500: {
			description: "サーバーエラー",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
	},
});

// ジム情報更新エンドポイント（管理者用）
registry.registerPath({
	method: "patch",
	path: "/api/gyms/admin/{gymId}",
	tags: ["gyms"],
	summary: "ジム情報更新（管理者用）",
	description: "指定されたIDのジム情報を更新します（管理者権限が必要）",
	security: [{ apiKey: [] }],
	parameters: [
		{
			name: "gymId",
			in: "path",
			schema: { type: "string", format: "uuid" },
			description: "ジムID",
			required: true,
		},
	],
	requestBody: {
		description: "更新するジム情報",
		content: {
			"application/json": {
				schema: registry.getRef("UpdateGymRequest"),
			},
		},
		required: true,
	},
	responses: {
		200: {
			description: "ジム情報の更新成功",
			content: {
				"application/json": {
					schema: registry.getRef("SuccessResponse"),
				},
			},
		},
		400: {
			description: "入力エラー",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
		401: {
			description: "認証エラー",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
		403: {
			description: "権限エラー",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
		404: {
			description: "ジムが見つかりません",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
		500: {
			description: "サーバーエラー",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
	},
});

// ジム削除エンドポイント（管理者用）
registry.registerPath({
	method: "delete",
	path: "/api/gyms/admin/{gymId}",
	tags: ["gyms"],
	summary: "ジム削除（管理者用）",
	description: "指定されたIDのジムを削除します（管理者権限が必要）",
	security: [{ apiKey: [] }],
	parameters: [
		{
			name: "gymId",
			in: "path",
			schema: { type: "string", format: "uuid" },
			description: "ジムID",
			required: true,
		},
	],
	responses: {
		200: {
			description: "ジムの削除成功",
			content: {
				"application/json": {
					schema: registry.getRef("SuccessResponse"),
				},
			},
		},
		401: {
			description: "認証エラー",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
		403: {
			description: "権限エラー",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
		404: {
			description: "ジムが見つかりません",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
		500: {
			description: "サーバーエラー",
			content: {
				"application/json": {
					schema: registry.getRef("ErrorResponse"),
				},
			},
		},
	},
});

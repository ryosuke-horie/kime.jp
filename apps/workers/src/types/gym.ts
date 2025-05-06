import { z } from "zod";
import { ISODateTime, PaginationMeta, UUID } from "./common";

// ジムの基本モデル
export const Gym = z.object({
	gymId: UUID.describe("ジムの一意識別子"),
	name: z.string().min(1).max(100).describe("ジム名"),
	ownerEmail: z.string().email().describe("オーナーのメールアドレス"),
	phoneNumber: z.string().optional().describe("電話番号"),
	createdAt: ISODateTime.describe("作成日時"),
	updatedAt: ISODateTime.describe("更新日時"),
});

export type GymType = z.infer<typeof Gym>;

// ジム作成リクエスト
export const CreateGymRequest = z.object({
	name: z.string().min(1).max(100).describe("ジム名"),
	ownerEmail: z.string().email().describe("オーナーのメールアドレス"),
	phoneNumber: z.string().optional().describe("電話番号"),
});

export type CreateGymRequestType = z.infer<typeof CreateGymRequest>;

// ジムアカウント発行リクエスト
export const CreateGymAccountRequest = z.object({
	// ジム情報
	name: z.string().min(1).max(100).describe("ジム名"),
	phoneNumber: z.string().describe("電話番号"),

	// オーナー情報
	ownerEmail: z.string().email().describe("オーナーのメールアドレス"),
	ownerName: z.string().min(1).describe("オーナー名"),
	password: z.string().min(8).describe("パスワード"),
});

export type CreateGymAccountRequestType = z.infer<typeof CreateGymAccountRequest>;

// ジムアカウント発行レスポンス
export const CreateGymAccountResponse = z.object({
	message: z.string().describe("成功メッセージ"),
	gymId: UUID.describe("作成されたジムのID"),
	ownerId: UUID.describe("作成されたオーナーのID"),
});

export type CreateGymAccountResponseType = z.infer<typeof CreateGymAccountResponse>;

// ジム作成レスポンス
export const CreateGymResponse = z.object({
	message: z.string().describe("成功メッセージ"),
	gymId: UUID.describe("作成されたジムのID"),
});

export type CreateGymResponseType = z.infer<typeof CreateGymResponse>;

// ジム更新リクエスト
export const UpdateGymRequest = z.object({
	name: z.string().min(1).max(100).optional().describe("ジム名"),
	ownerEmail: z.string().email().optional().describe("オーナーのメールアドレス"),
	phoneNumber: z.string().optional().describe("電話番号"),
});

export type UpdateGymRequestType = z.infer<typeof UpdateGymRequest>;

// ジム一覧レスポンス
export const GymListResponse = z.object({
	gyms: z.array(Gym).describe("ジム一覧"),
	meta: PaginationMeta.optional().describe("ページネーション情報"),
});

export type GymListResponseType = z.infer<typeof GymListResponse>;

// ジム詳細レスポンス
export const GymDetailResponse = z.object({
	gym: Gym.describe("ジム情報"),
});

export type GymDetailResponseType = z.infer<typeof GymDetailResponse>;

// テスト用エラーレスポンススキーマ定義
const ErrorResponseSchema = {
	type: "object",
	properties: {
		error: { type: "string" },
	},
	required: ["error"],
};

// テスト用成功レスポンススキーマ定義
const SuccessResponseSchema = {
	type: "object",
	properties: {
		message: { type: "string" },
	},
	required: ["message"],
};

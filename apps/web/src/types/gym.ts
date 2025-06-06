import { z } from "zod";
import { ISODateTime, PaginationMeta, UUID } from "./common";

// ジムの基本モデル
export const Gym = z.object({
	gymId: UUID.describe("ジムの一意識別子"),
	name: z.string().min(1).max(100).describe("ジム名"),
	ownerEmail: z.string().email().describe("オーナーのメールアドレス"),
	phone: z.string().max(20).optional().describe("電話番号"),
	website: z.string().url().optional().describe("Webサイト"),
	address: z.string().max(200).optional().describe("住所"),
	description: z.string().max(1000).optional().describe("説明"),
	createdAt: ISODateTime.describe("作成日時"),
	updatedAt: ISODateTime.describe("更新日時"),
});

export type GymType = z.infer<typeof Gym>;

// ジム作成リクエスト
export const CreateGymRequest = z.object({
	name: z.string().min(1).max(100).describe("ジム名"),
	ownerEmail: z.string().email().describe("オーナーのメールアドレス"),
	password: z.string().min(8).max(100).describe("ジムオーナーのログインパスワード"),
	phone: z.string().max(20).optional().describe("電話番号"),
	website: z.string().url().optional().describe("Webサイト"),
	address: z.string().max(200).optional().describe("住所"),
	description: z.string().max(1000).optional().describe("説明"),
});

export type CreateGymRequestType = z.infer<typeof CreateGymRequest>;

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
	password: z.string().min(8).max(100).optional().describe("ジムオーナーのログインパスワード"),
	phone: z.string().max(20).optional().describe("電話番号"),
	website: z.string().url().optional().describe("Webサイト"),
	address: z.string().max(200).optional().describe("住所"),
	description: z.string().max(1000).optional().describe("説明"),
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

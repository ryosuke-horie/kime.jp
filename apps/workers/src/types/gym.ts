import { z } from "zod";
import { ISODateTime, PaginationMeta, UUID } from "./common";

// ジムの基本モデル
export const Gym = z.object({
	gymId: UUID.describe("ジムの一意識別子"),
	name: z.string().min(1).max(100).describe("ジム名"),
	timezone: z.string().default("Asia/Tokyo").describe("タイムゾーン"),
	ownerEmail: z.string().email().describe("オーナーのメールアドレス"),
	plan: z.enum(["basic", "premium", "enterprise"]).default("basic").describe("契約プラン"),
	createdAt: ISODateTime.describe("作成日時"),
	updatedAt: ISODateTime.describe("更新日時"),
});

export type GymType = z.infer<typeof Gym>;

// ジム作成リクエスト
export const CreateGymRequest = z.object({
	name: z.string().min(1).max(100).describe("ジム名"),
	timezone: z.string().optional().describe("タイムゾーン"),
	ownerEmail: z.string().email().describe("オーナーのメールアドレス"),
	plan: z.enum(["basic", "premium", "enterprise"]).optional().describe("契約プラン"),
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
	timezone: z.string().optional().describe("タイムゾーン"),
	ownerEmail: z.string().email().optional().describe("オーナーのメールアドレス"),
	plan: z.enum(["basic", "premium", "enterprise"]).optional().describe("契約プラン"),
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

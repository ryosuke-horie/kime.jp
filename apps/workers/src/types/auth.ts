import { z } from "zod";
import { ErrorResponse, ISODateTime, UUID } from "./common";
import { registry } from "./openapi/config";

// 管理者アカウントのロール
export const AdminRole = z.enum(["admin", "staff"]).describe("管理者ロール");
export type AdminRoleType = z.infer<typeof AdminRole>;

// ジム内の管理者ロール
export const GymAdminRole = z
	.enum(["owner", "manager", "staff"])
	.describe("ジム内での管理者ロール");
export type GymAdminRoleType = z.infer<typeof GymAdminRole>;

// 認証プロバイダーの種類
export const OAuthProvider = z.enum(["google", "line"]).describe("OAuth認証プロバイダー");
export type OAuthProviderType = z.infer<typeof OAuthProvider>;

// 管理者アカウント（トークン検証の戻り値として使用する型）
export const AdminAccount = z.object({
	adminId: UUID.describe("管理者ID"),
	email: z.string().email().describe("メールアドレス"),
	name: z.string().describe("名前"),
	role: AdminRole,
	isActive: z.boolean().describe("アクティブ状態"),
	createdAt: ISODateTime.optional(),
	updatedAt: ISODateTime.optional(),
});

registry.register("AdminAccount", AdminAccount);
export type AdminAccountType = z.infer<typeof AdminAccount>;

// 管理者登録リクエスト
export const CreateAdminRequest = z.object({
	email: z.string().email().describe("メールアドレス"),
	name: z.string().describe("名前"),
	password: z.string().min(8).describe("パスワード（8文字以上）"),
	role: AdminRole.optional().default("staff"),
});

registry.register("CreateAdminRequest", CreateAdminRequest);
export type CreateAdminRequestType = z.infer<typeof CreateAdminRequest>;

// 管理者ログインリクエスト
export const AdminLoginRequest = z.object({
	email: z.string().email().describe("メールアドレス"),
	password: z.string().describe("パスワード"),
});

registry.register("AdminLoginRequest", AdminLoginRequest);
export type AdminLoginRequestType = z.infer<typeof AdminLoginRequest>;

// ログインレスポンス
export const LoginResponse = z.object({
	token: z.string().describe("JWTトークン"),
	admin: AdminAccount,
});

registry.register("LoginResponse", LoginResponse);
export type LoginResponseType = z.infer<typeof LoginResponse>;

// OAuth登録リクエスト
export const OAuthRegisterRequest = z.object({
	email: z.string().email().describe("メールアドレス"),
	name: z.string().describe("名前"),
	provider: OAuthProvider,
	providerAccountId: z.string().describe("プロバイダーから取得したアカウントID"),
	accessToken: z.string().describe("アクセストークン"),
	refreshToken: z.string().optional().describe("リフレッシュトークン"),
	expiresAt: z.number().optional().describe("トークン有効期限"),
	tokenType: z.string().optional().describe("トークンタイプ"),
	scope: z.string().optional().describe("スコープ"),
	idToken: z.string().optional().describe("IDトークン"),
});

registry.register("OAuthRegisterRequest", OAuthRegisterRequest);
export type OAuthRegisterRequestType = z.infer<typeof OAuthRegisterRequest>;

// ジム管理者の関連付けリクエスト
export const AdminGymLinkRequest = z.object({
	adminId: UUID.describe("管理者ID"),
	gymId: UUID.describe("ジムID"),
	role: GymAdminRole.optional().default("staff"),
});

registry.register("AdminGymLinkRequest", AdminGymLinkRequest);
export type AdminGymLinkRequestType = z.infer<typeof AdminGymLinkRequest>;

// トークン検証エラー
export const TokenVerificationError = ErrorResponse.extend({
	code: z.enum(["invalid_token", "expired_token", "missing_token"]).describe("エラーコード"),
});

registry.register("TokenVerificationError", TokenVerificationError);
export type TokenVerificationErrorType = z.infer<typeof TokenVerificationError>;

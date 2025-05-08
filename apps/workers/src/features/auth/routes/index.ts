import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../../../env";
import { getDatabaseClient } from "../../../lib/clients";
import { generateToken } from "../../../utils/jwt";

// 共通型定義
export const UUID = z.string().uuid().describe("UUID形式の識別子");

// 管理者アカウントのロール
export const AdminRole = z.enum(["admin", "staff"]).describe("管理者ロール");
export type AdminRoleType = z.infer<typeof AdminRole>;

// 認証プロバイダーの種類
export const OAuthProvider = z.enum(["google", "line"]).describe("OAuth認証プロバイダー");
export type OAuthProviderType = z.infer<typeof OAuthProvider>;

// ISOフォーマットの日時
export const ISODateTime = z.string().datetime().describe("ISO形式の日時");

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

export type AdminAccountType = z.infer<typeof AdminAccount>;

// 管理者登録リクエスト
export const CreateAdminRequest = z.object({
	email: z.string().email().describe("メールアドレス"),
	name: z.string().describe("名前"),
	password: z.string().min(8).describe("パスワード（8文字以上）"),
	role: AdminRole.optional().default("staff"),
});

export type CreateAdminRequestType = z.infer<typeof CreateAdminRequest>;

// 管理者ログインリクエスト
export const AdminLoginRequest = z.object({
	email: z.string().email().describe("メールアドレス"),
	password: z.string().describe("パスワード"),
});

export type AdminLoginRequestType = z.infer<typeof AdminLoginRequest>;

// ログインレスポンス
export const LoginResponse = z.object({
	token: z.string().describe("JWTトークン"),
	admin: AdminAccount,
});

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

export type OAuthRegisterRequestType = z.infer<typeof OAuthRegisterRequest>;

// 認証ルーター
export const authRouter = new Hono<{ Bindings: Env; Variables: { admin?: AdminAccountType } }>();

// 管理者登録（内部API）
authRouter.post("/register", zValidator("json", CreateAdminRequest), async (c) => {
	const { email, name, password, role } = c.req.valid("json");

	// TODO: パスワードのハッシュ化処理
	const passwordHash = `hashed_${password}`; // 実際の実装ではbcryptなどを使用

	const dbClient = getDatabaseClient(c.env);

	// メールアドレスの重複チェック
	const existingUser = await dbClient.queryOne("admin_accounts", { email });
	if (existingUser.success && existingUser.data) {
		return c.json({ error: "このメールアドレスは既に使用されています" }, 400);
	}

	// 管理者アカウントを作成
	const adminId = crypto.randomUUID();
	const result = await dbClient.create("admin_accounts", {
		adminId,
		email,
		name,
		role,
		passwordHash,
		isActive: 1,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	});

	if (!result.success) {
		return c.json({ error: result.error || "管理者アカウントの作成に失敗しました" }, 500);
	}

	// JWTトークンを生成
	const admin = {
		adminId,
		email,
		name,
		role: role as "admin" | "staff",
		isActive: true,
	};

	const token = await generateToken(admin, c.env.JWT_SECRET || "your-development-secret-key");

	return c.json(
		{
			token,
			admin,
		},
		201,
	);
});

// 管理者ログイン
authRouter.post("/login", zValidator("json", AdminLoginRequest), async (c) => {
	const { email, password } = c.req.valid("json");

	const dbClient = getDatabaseClient(c.env);

	// 管理者アカウントを検索
	const result = await dbClient.queryOne("admin_accounts", { email });

	if (!result.success || !result.data) {
		return c.json({ error: "メールアドレスまたはパスワードが正しくありません" }, 401);
	}

	const admin = result.data;

	// パスワードの検証
	// TODO: 実際の実装ではbcrypt.compareなどを使用
	const isValidPassword = admin.passwordHash === `hashed_${password}`;

	if (!isValidPassword) {
		return c.json({ error: "メールアドレスまたはパスワードが正しくありません" }, 401);
	}

	// アカウントが無効の場合
	if (!admin.isActive) {
		return c.json({ error: "このアカウントは現在無効化されています" }, 403);
	}

	// JWTトークンを生成
	const adminData = {
		adminId: admin.adminId as string,
		email: admin.email as string,
		name: admin.name as string,
		role: admin.role as "admin" | "staff",
		isActive: Boolean(admin.isActive),
	};

	const token = await generateToken(adminData, c.env.JWT_SECRET || "your-development-secret-key");

	// 最終ログイン日時を更新
	await dbClient.update("admin_accounts", admin.adminId as string, {
		lastLoginAt: new Date().toISOString(),
	});

	return c.json({
		token,
		admin: adminData,
	});
});

// OAuth認証登録/ログイン
authRouter.post("/oauth", zValidator("json", OAuthRegisterRequest), async (c) => {
	const {
		email,
		name,
		provider,
		providerAccountId,
		accessToken,
		refreshToken,
		expiresAt,
		idToken,
	} = c.req.valid("json");

	const dbClient = getDatabaseClient(c.env);

	// 既存のOAuthアカウントを検索
	const existingOAuth = await dbClient.queryOne("admin_oauth_accounts", {
		provider,
		providerAccountId,
	});

	let adminId = "";
	// 管理者データを格納する変数
	let adminData:
		| {
				adminId: string;
				email: string;
				name: string;
				role: "admin" | "staff";
				isActive: boolean;
		  }
		| undefined;

	if (existingOAuth.success && existingOAuth.data) {
		// 既存OAuthアカウントの場合は関連する管理者アカウントを取得
		adminId = existingOAuth.data.adminId as string;
		const admin = await dbClient.getOne("admin_accounts", adminId);

		if (!admin.success || !admin.data) {
			return c.json({ error: "アカウントが見つかりません" }, 404);
		}

		// アカウントが無効の場合
		if (!admin.data.isActive) {
			return c.json({ error: "このアカウントは現在無効化されています" }, 403);
		}

		adminData = {
			adminId: admin.data.adminId as string,
			email: admin.data.email as string,
			name: admin.data.name as string,
			role: admin.data.role as "admin" | "staff",
			isActive: Boolean(admin.data.isActive),
		};

		// トークン情報を更新
		await dbClient.update("admin_oauth_accounts", existingOAuth.data.oauthId as string, {
			accessToken,
			refreshToken,
			expiresAt,
			idToken,
			updatedAt: new Date().toISOString(),
		});
	} else {
		// 新規ユーザーの場合

		// メールアドレスでの既存ユーザー検索
		const existingUser = await dbClient.queryOne("admin_accounts", { email });

		if (existingUser.success && existingUser.data) {
			// 既存の管理者アカウントがある場合は、OAuthアカウントを関連付け
			adminId = existingUser.data.adminId as string;
			adminData = {
				adminId,
				email: existingUser.data.email as string,
				name: existingUser.data.name as string,
				role: existingUser.data.role as "admin" | "staff",
				isActive: Boolean(existingUser.data.isActive),
			};
		} else {
			// 新規管理者アカウントを作成
			adminId = crypto.randomUUID();
			const createResult = await dbClient.create("admin_accounts", {
				adminId,
				email,
				name,
				role: "staff", // デフォルトは一般スタッフ
				isActive: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});

			if (!createResult.success) {
				return c.json({ error: createResult.error || "アカウントの作成に失敗しました" }, 500);
			}

			adminData = {
				adminId,
				email,
				name,
				role: "staff" as const,
				isActive: true,
			};
		}

		// OAuth情報を保存
		const oauthId = crypto.randomUUID();
		const oauthResult = await dbClient.create("admin_oauth_accounts", {
			oauthId,
			adminId,
			provider,
			providerAccountId,
			accessToken,
			refreshToken,
			expiresAt,
			idToken,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		if (!oauthResult.success) {
			return c.json({ error: oauthResult.error || "OAuth情報の保存に失敗しました" }, 500);
		}
	}

	// 最終ログイン日時を更新
	await dbClient.update("admin_accounts", adminId, {
		lastLoginAt: new Date().toISOString(),
	});

	// JWTトークンを生成
	const token = await generateToken(adminData as AdminAccountType, c.env.JWT_SECRET || "your-development-secret-key");

	return c.json({
		token,
		admin: adminData,
	});
});

// 自分の管理者情報を取得
authRouter.get("/me", async (c) => {
	const admin = c.get("admin");

	if (!admin) {
		return c.json({ error: "認証が必要です" }, 401);
	}

	return c.json(admin);
});

export default authRouter;

import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../../../env";
import { getDatabaseClient } from "../../../lib/do-client";
import {
	AdminAccount,
	AdminLoginRequest,
	CreateAdminRequest,
	LoginResponse,
	OAuthRegisterRequest,
} from "../../../types/auth";
import { generateToken } from "../../../utils/jwt";
import { validateBody, validatedJson } from "../../../utils/validator";

// 認証ルーター
export const authRouter = new Hono<{ Bindings: Env }>();

// 管理者登録（内部API）
authRouter.post("/register", validateBody(CreateAdminRequest), async (c) => {
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
		role,
		isActive: true,
	};

	const token = await generateToken(admin, c.env.JWT_SECRET || "your-development-secret-key");

	return validatedJson(
		c,
		LoginResponse,
		{
			token,
			admin,
		},
		201,
	);
});

// 管理者ログイン
authRouter.post("/login", validateBody(AdminLoginRequest), async (c) => {
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
		adminId: admin.adminId,
		email: admin.email,
		name: admin.name,
		role: admin.role,
		isActive: Boolean(admin.isActive),
	};

	const token = await generateToken(adminData, c.env.JWT_SECRET || "your-development-secret-key");

	// 最終ログイン日時を更新
	await dbClient.update("admin_accounts", admin.adminId, {
		lastLoginAt: new Date().toISOString(),
	});

	return validatedJson(c, LoginResponse, {
		token,
		admin: adminData,
	});
});

// OAuth認証登録/ログイン
authRouter.post("/oauth", validateBody(OAuthRegisterRequest), async (c) => {
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
				role: string;
				isActive: boolean;
		  }
		| undefined;

	if (existingOAuth.success && existingOAuth.data) {
		// 既存OAuthアカウントの場合は関連する管理者アカウントを取得
		adminId = existingOAuth.data.adminId;
		const admin = await dbClient.getOne("admin_accounts", adminId);

		if (!admin.success || !admin.data) {
			return c.json({ error: "アカウントが見つかりません" }, 404);
		}

		// アカウントが無効の場合
		if (!admin.data.isActive) {
			return c.json({ error: "このアカウントは現在無効化されています" }, 403);
		}

		adminData = {
			adminId: admin.data.adminId,
			email: admin.data.email,
			name: admin.data.name,
			role: admin.data.role,
			isActive: Boolean(admin.data.isActive),
		};

		// トークン情報を更新
		await dbClient.update("admin_oauth_accounts", existingOAuth.data.oauthId, {
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
			adminId = existingUser.data.adminId;
			adminData = {
				adminId,
				email: existingUser.data.email,
				name: existingUser.data.name,
				role: existingUser.data.role,
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
				role: "staff",
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
	const token = await generateToken(adminData, c.env.JWT_SECRET || "your-development-secret-key");

	return validatedJson(c, LoginResponse, {
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

	return validatedJson(c, AdminAccount, admin);
});

export default authRouter;

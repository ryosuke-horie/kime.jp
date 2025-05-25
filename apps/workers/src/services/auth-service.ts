import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { gyms } from "../db/schema";
import type { JWTPayload, LoginRequest, LoginResponse, User } from "../types/auth";
import * as jwtUtils from "../utils/jwt";
import * as passwordUtils from "../utils/password";

export class AuthService {
	constructor(private db: DrizzleD1Database) {}

	/**
	 * ログイン認証を実行
	 */
	async login(request: LoginRequest): Promise<LoginResponse> {
		// メールアドレスでジムを検索
		const gym = await this.db.select().from(gyms).where(eq(gyms.ownerEmail, request.email)).get();

		if (!gym) {
			return {
				success: false,
				error: "Invalid credentials",
			};
		}

		// パスワードハッシュが設定されているか確認
		if (!gym.passwordHash) {
			return {
				success: false,
				error: "Account disabled",
			};
		}

		// パスワード検証
		const isPasswordValid = await passwordUtils.comparePassword(request.password, gym.passwordHash);
		if (!isPasswordValid) {
			return {
				success: false,
				error: "Invalid credentials",
			};
		}

		// JWTトークン生成
		const isTestEnv = process.env.NODE_ENV === "test";
		const token = await jwtUtils.generateJWT(
			{
				userId: gym.gymId,
				email: gym.ownerEmail,
				gymId: gym.gymId,
				role: "owner",
			},
			isTestEnv ? "test-secret" : undefined,
		);

		// ユーザー情報作成
		const user: User = {
			id: gym.gymId,
			email: gym.ownerEmail,
			gymId: gym.gymId,
			role: "owner",
			name: gym.name,
		};

		return {
			success: true,
			token,
			user,
		};
	}

	/**
	 * JWTペイロードからユーザー情報を取得
	 */
	async getUserFromToken(payload: JWTPayload): Promise<User | undefined> {
		try {
			// ジム情報を取得
			const gym = await this.db.select().from(gyms).where(eq(gyms.gymId, payload.gymId)).get();

			if (!gym) {
				return undefined;
			}

			return {
				id: gym.gymId,
				email: gym.ownerEmail,
				gymId: gym.gymId,
				role: payload.role,
				name: gym.name,
			};
		} catch (error) {
			// エラーが発生した場合はundefinedを返す
			return undefined;
		}
	}
}

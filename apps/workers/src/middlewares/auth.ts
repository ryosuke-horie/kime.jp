/**
 * JWT認証ミドルウェア
 * Honoアプリケーション用のJWT検証とアクセス制御を提供
 */

import type { Context, Next } from "hono";
import type { AuthenticatedContext } from "../types/auth";
import { verifyJWT } from "../utils/jwt";

/**
 * Hono Context に認証情報を追加する型定義
 */
declare module "hono" {
	interface ContextVariableMap {
		auth: AuthenticatedContext;
	}
}

/**
 * JWT認証ミドルウェア
 * Authorization: Bearer <token> 形式のヘッダーからJWTを検証する
 */
export function jwtAuth() {
	return async (c: Context, next: Next) => {
		const authHeader = c.req.header("Authorization");

		if (!authHeader) {
			return c.json({ error: "Missing authorization header" }, 401);
		}

		// Bearer形式の確認
		const parts = authHeader.split(" ");
		if (parts.length !== 2 || parts[0] !== "Bearer") {
			return c.json({ error: "Invalid authorization header format" }, 401);
		}

		const token = parts[1];
		if (!token) {
			return c.json({ error: "Missing token" }, 401);
		}

		// JWT検証
		const result = await verifyJWT(token);
		if (!result.success || !result.payload) {
			return c.json({ error: result.error || "Invalid token" }, 401);
		}

		// コンテキストに認証情報を設定
		const authContext: AuthenticatedContext = {
			payload: result.payload,
			userId: result.payload.sub,
			gymId: result.payload.gymId,
			role: result.payload.role,
			email: result.payload.email,
		};

		c.set("auth", authContext);
		return await next();
	};
}

/**
 * ジムアクセス制御ミドルウェア
 * ルートパラメータのgymIdとJWTのgymIdが一致することを確認する
 */
export function requireGymAccess() {
	return async (c: Context, next: Next) => {
		// 認証情報の確認
		const auth = c.get("auth");
		if (!auth) {
			return c.json({ error: "Authentication required" }, 401);
		}

		// ルートパラメータからgymIdを取得
		const gymIdParam = c.req.param("gymId");
		if (!gymIdParam) {
			return c.json({ error: "Missing gymId parameter" }, 400);
		}

		// gymIDの一致確認
		if (auth.gymId !== gymIdParam) {
			return c.json({ error: "Access denied: gym ID mismatch" }, 403);
		}

		return await next();
	};
}

/**
 * 管理者権限チェックミドルウェア（将来用）
 * オーナーロールのみアクセス可能
 */
export function requireOwnerRole() {
	return async (c: Context, next: Next) => {
		const auth = c.get("auth");
		if (!auth) {
			return c.json({ error: "Authentication required" }, 401);
		}

		if (auth.role !== "owner") {
			return c.json({ error: "Owner role required" }, 403);
		}

		return await next();
	};
}

/**
 * スタッフ以上の権限チェックミドルウェア（将来用）
 * オーナー・スタッフロールでアクセス可能
 */
export function requireStaffOrOwner() {
	return async (c: Context, next: Next) => {
		const auth = c.get("auth");
		if (!auth) {
			return c.json({ error: "Authentication required" }, 401);
		}

		if (auth.role !== "owner" && auth.role !== "staff") {
			return c.json({ error: "Staff or owner role required" }, 403);
		}

		return await next();
	};
}

import type { AdminAccountType } from "../types/auth";

/**
 * JWTトークンの検証と解析を行うユーティリティ
 * 注: 実際の実装では crypto.subtle.importKey と crypto.subtle.verify を使用して署名検証を行います
 */

// JWTペイロード型定義
interface JWTPayload {
	sub: string; // 管理者ID
	email: string;
	name: string;
	role: string;
	iat: number; // 発行時刻
	exp: number; // 有効期限
}

/**
 * JWTトークンを検証し、ペイロードを取得する
 * @param token JWTトークン
 * @param secret 秘密鍵（環境変数から取得）
 * @returns 検証結果とペイロード
 */
export async function verifyToken(
	token: string,
	secret: string,
): Promise<{ valid: boolean; payload: JWTPayload | null; error?: string }> {
	try {
		// トークンが存在しない場合
		if (!token) {
			return { valid: false, payload: null, error: "missing_token" };
		}

		// トークンの構造を検証
		const parts = token.split(".");
		if (parts.length !== 3) {
			return { valid: false, payload: null, error: "invalid_token" };
		}

		// ペイロードをデコード
		const payloadBase64 = parts[1];
		const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
		const payload = JSON.parse(payloadJson) as JWTPayload;

		// 有効期限を検証
		const now = Math.floor(Date.now() / 1000);
		if (payload.exp < now) {
			return { valid: false, payload: null, error: "expired_token" };
		}

		// TODO: 実際の実装では署名の検証を行う
		// ここでは簡易的に有効としています
		return { valid: true, payload };
	} catch (error) {
		console.error("Token verification error:", error);
		return { valid: false, payload: null, error: "invalid_token" };
	}
}

/**
 * JWTペイロードから管理者アカウント情報を抽出する
 * @param payload JWTペイロード
 * @returns 管理者アカウント情報
 */
export function extractAdminFromPayload(payload: JWTPayload): AdminAccountType {
	return {
		adminId: payload.sub,
		email: payload.email,
		name: payload.name,
		role: payload.role as AdminAccountType["role"],
		isActive: true,
	};
}

/**
 * 管理者アカウント情報からJWTトークンを生成する
 * @param admin 管理者アカウント情報
 * @param secret 秘密鍵（環境変数から取得）
 * @param expiresIn トークンの有効期間（秒）
 * @returns 生成されたJWTトークン
 */
export async function generateToken(
	admin: AdminAccountType,
	secret: string,
	expiresIn = 30 * 24 * 60 * 60, // デフォルト30日
): Promise<string> {
	// ヘッダー
	const header = {
		alg: "HS256",
		typ: "JWT",
	};

	// 現在時刻（UNIX時間）
	const now = Math.floor(Date.now() / 1000);

	// ペイロード
	const payload: JWTPayload = {
		sub: admin.adminId,
		email: admin.email,
		name: admin.name,
		role: admin.role,
		iat: now,
		exp: now + expiresIn,
	};

	// Base64エンコード
	const headerBase64 = btoa(JSON.stringify(header))
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
	const payloadBase64 = btoa(JSON.stringify(payload))
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");

	// TODO: 実際の実装では crypto.subtle.sign を使用して署名を生成する
	// ここでは簡易的に署名部分をダミーとしています
	const signatureBase64 = "dummy_signature";

	// トークンを組み立てる
	return `${headerBase64}.${payloadBase64}.${signatureBase64}`;
}

/**
 * パスワードをハッシュ化する
 * @param password プレーンテキストのパスワード
 * @returns ハッシュ化されたパスワード
 */
export async function hashPassword(password: string): Promise<string> {
	// 実際の実装ではbcryptなどのライブラリを使用してハッシュ化する
	// ここではデモ実装として簡易的なハッシュ化処理を行う
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	return hashHex;
}
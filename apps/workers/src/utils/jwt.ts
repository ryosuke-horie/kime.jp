/**
 * JWT ユーティリティ関数
 * Cloudflare Workers の Web Crypto API を使用してHS256署名を実装
 */

import type { JWTGenerateOptions, JWTPayload, JWTVerifyResult } from "../types/auth";

/**
 * JWTを生成する
 * HS256アルゴリズムを使用してセキュアなトークンを生成
 */
export async function generateJWT(
	options: JWTGenerateOptions,
	testSecret?: string,
): Promise<string> {
	const { userId, email, gymId, role, expiresInDays = 30 } = options;

	// JWT_SECRET環境変数の確認（テスト用シークレットが提供されている場合はそれを使用）
	const secret = testSecret || process.env.JWT_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET environment variable is not set");
	}

	// ヘッダー生成
	const header = {
		alg: "HS256",
		typ: "JWT",
	};

	// ペイロード生成
	const now = Math.floor(Date.now() / 1000);
	const exp = now + expiresInDays * 24 * 60 * 60; // 指定日数後

	const payload: JWTPayload = {
		sub: userId,
		email,
		gymId,
		role,
		iat: now,
		exp,
	};

	// Base64URLエンコード
	const headerBase64 = base64UrlEncode(JSON.stringify(header));
	const payloadBase64 = base64UrlEncode(JSON.stringify(payload));

	// 署名対象データ
	const data = `${headerBase64}.${payloadBase64}`;

	// HMAC-SHA256で署名生成
	const signature = await generateSignature(data, secret);

	return `${data}.${signature}`;
}

/**
 * JWTを検証する
 */
export async function verifyJWT(token: string, testSecret?: string): Promise<JWTVerifyResult> {
	try {
		// 基本的な形式チェック
		if (!token || typeof token !== "string") {
			return {
				success: false,
				error: "Invalid token format",
			};
		}

		const parts = token.split(".");
		if (parts.length !== 3) {
			return {
				success: false,
				error: "Invalid JWT format",
			};
		}

		const [headerBase64, payloadBase64, signatureBase64] = parts;

		if (!headerBase64 || !payloadBase64 || !signatureBase64) {
			return {
				success: false,
				error: "Invalid JWT format",
			};
		}

		// JWT_SECRET環境変数の確認（テスト用シークレットが提供されている場合はそれを使用）
		const secret = testSecret || process.env.JWT_SECRET;
		if (!secret) {
			return {
				success: false,
				error: "JWT_SECRET environment variable is not set",
			};
		}

		// 署名検証
		const data = `${headerBase64}.${payloadBase64}`;
		const expectedSignature = await generateSignature(data, secret);

		if (signatureBase64 !== expectedSignature) {
			return {
				success: false,
				error: "Invalid signature",
			};
		}

		// ペイロード復号化
		const payloadJson = base64UrlDecode(payloadBase64);
		const payload = JSON.parse(payloadJson) as JWTPayload;

		// 有効期限チェック
		const now = Math.floor(Date.now() / 1000);
		if (payload.exp && payload.exp < now) {
			return {
				success: false,
				error: "Token expired",
			};
		}

		// 必須フィールドの検証
		if (!payload.sub || !payload.email || !payload.gymId || !payload.role) {
			return {
				success: false,
				error: "Missing required payload fields",
			};
		}

		return {
			success: true,
			payload,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "JWT verification failed",
		};
	}
}

/**
 * HMAC-SHA256署名を生成する
 */
async function generateSignature(data: string, secret: string): Promise<string> {
	const encoder = new TextEncoder();
	const secretBuffer = encoder.encode(secret);
	const dataBuffer = encoder.encode(data);

	// HMAC-SHA256キーをインポート
	const key = await crypto.subtle.importKey(
		"raw",
		secretBuffer,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	// 署名生成
	const signature = await crypto.subtle.sign("HMAC", key, dataBuffer);

	// Base64URLエンコードして返す
	return base64UrlEncode(new Uint8Array(signature));
}

/**
 * Base64URLエンコード
 */
function base64UrlEncode(input: string | Uint8Array): string {
	let base64: string;

	if (typeof input === "string") {
		base64 = btoa(input);
	} else {
		// Uint8Arrayの場合
		const bytes = Array.from(input);
		base64 = btoa(String.fromCharCode(...bytes));
	}

	// Base64URLに変換（+, /, = を置換・削除）
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Base64URLデコード
 */
function base64UrlDecode(input: string): string {
	// Base64URLをBase64に変換
	let base64 = input.replace(/-/g, "+").replace(/_/g, "/");

	// パディングを追加
	const padding = base64.length % 4;
	if (padding === 2) {
		base64 += "==";
	} else if (padding === 3) {
		base64 += "=";
	}

	return atob(base64);
}

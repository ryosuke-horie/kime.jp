"use client";

import type { Session } from "next-auth";
import { getSession } from "next-auth/react";

/**
 * NextAuthセッションからトークンを取得する
 * シークレットは必要ないため省略
 * @returns 認証トークン（存在しない場合はnull）
 */
export async function getAuthToken(): Promise<string | null> {
	const session = await getSession();

	if (!session) {
		return null;
	}

	// Next.jsはサーバーでJWTを生成し、クライアントにはセッションオブジェクトのみ提供される
	// ここではsessionオブジェクト自体をトークンとして使用する代替案
	// 実際の実装ではNextAuthの内部トークンにアクセスする方法が必要
	return createSimulatedToken(session);
}

/**
 * セッション情報からシミュレートされたトークンを生成する
 * これは暫定的な実装で、実際にはNext.jsやNextAuthの内部処理でJWTが管理される
 * @param session NextAuthのセッション情報
 * @returns 生成されたトークン
 */
function createSimulatedToken(session: Session): string {
	// セッション情報からペイロードを作成
	const payload = {
		sub: session.user.id,
		name: session.user.name,
		email: session.user.email,
		role: session.user.role,
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30日
	};

	// Base64エンコード
	const headerBase64 = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
	const payloadBase64 = btoa(JSON.stringify(payload))
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");

	// 署名部分はダミー（実際にはサーバー側で署名される）
	const signatureBase64 = "dummy_signature";

	// トークンを組み立てる
	return `${headerBase64}.${payloadBase64}.${signatureBase64}`;
}

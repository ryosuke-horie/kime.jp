/**
 * パスワードハッシュ化・検証ユーティリティ
 * Cloudflare WorkersのWeb Crypto APIを使用
 */

/**
 * パスワードをハッシュ化する
 * PBKDF2アルゴリズムを使用してセキュアなハッシュを生成
 */
export async function hashPassword(password: string): Promise<string> {
	if (!password) {
		throw new Error("Password cannot be empty");
	}

	// ランダムなソルトを生成（16バイト）
	const salt = crypto.getRandomValues(new Uint8Array(16));

	// パスワードをUint8Arrayに変換
	const encoder = new TextEncoder();
	const passwordBuffer = encoder.encode(password);

	// PBKDF2でハッシュ化
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		passwordBuffer,
		{ name: "PBKDF2" },
		false,
		["deriveBits"],
	);

	// 100,000回の反復でハッシュを生成
	const hash = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			salt,
			iterations: 100000,
			hash: "SHA-256",
		},
		keyMaterial,
		256, // 256ビット = 32バイト
	);

	// ソルトとハッシュを結合して保存
	// 形式: salt:hash（それぞれbase64エンコード）
	const hashArray = new Uint8Array(hash);
	const saltBase64 = btoa(String.fromCharCode(...salt));
	const hashBase64 = btoa(String.fromCharCode(...hashArray));

	return `${saltBase64}:${hashBase64}`;
}

/**
 * パスワードとハッシュを比較検証する
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
	try {
		// 空のハッシュや不正な形式の場合はfalseを返す
		if (!hashedPassword || !hashedPassword.includes(":")) {
			return false;
		}

		// ソルトとハッシュを分離
		const [saltBase64, hashBase64] = hashedPassword.split(":");
		if (!saltBase64 || !hashBase64) {
			return false;
		}

		// base64からUint8Arrayに変換
		const salt = Uint8Array.from(atob(saltBase64), (c) => c.charCodeAt(0));
		const originalHash = Uint8Array.from(atob(hashBase64), (c) => c.charCodeAt(0));

		// 入力されたパスワードを同じソルトでハッシュ化
		const encoder = new TextEncoder();
		const passwordBuffer = encoder.encode(password);

		const keyMaterial = await crypto.subtle.importKey(
			"raw",
			passwordBuffer,
			{ name: "PBKDF2" },
			false,
			["deriveBits"],
		);

		const newHash = await crypto.subtle.deriveBits(
			{
				name: "PBKDF2",
				salt,
				iterations: 100000,
				hash: "SHA-256",
			},
			keyMaterial,
			256,
		);

		// ハッシュを比較
		const newHashArray = new Uint8Array(newHash);
		return constantTimeEqual(originalHash, newHashArray);
	} catch (error) {
		// エラーが発生した場合はfalseを返す
		return false;
	}
}

/**
 * タイミング攻撃を防ぐための定数時間比較
 */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) {
		return false;
	}

	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a[i]! ^ b[i]!;
	}

	return result === 0;
}

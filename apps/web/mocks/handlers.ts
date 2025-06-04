/**
 * MSW API モッキングハンドラー
 * テスト時のAPIリクエストをインターセプトしてモックレスポンスを返す
 */
import { http, HttpResponse } from "msw";

// APIハンドラーの定義
export const handlers = [
	// ユーザー一覧取得のモック
	http.get("/api/users", () => {
		return HttpResponse.json([
			{ id: 1, name: "田中太郎", email: "tanaka@example.com" },
			{ id: 2, name: "佐藤花子", email: "sato@example.com" },
		]);
	}),

	// ユーザー作成のモック
	http.post("/api/users", async ({ request }) => {
		const user = await request.json();
		return HttpResponse.json(
			{
				id: 3,
				...user,
				createdAt: new Date().toISOString(),
			},
			{ status: 201 },
		);
	}),

	// 認証エンドポイントのモック
	http.post("/api/auth/signin", async ({ request }) => {
		const { email, password } = (await request.json()) as { email: string; password: string };

		if (email === "test@example.com" && password === "password") {
			return HttpResponse.json({
				user: { id: 1, name: "テストユーザー", email: "test@example.com" },
				token: "mock-jwt-token",
			});
		}

		return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
	}),

	// エラーレスポンスのテスト用
	http.get("/api/error", () => {
		return HttpResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}),
];

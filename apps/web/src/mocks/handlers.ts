/**
 * MSW（Mock Service Worker）のリクエストハンドラー定義
 * APIリクエストをモックして、テスト環境で予測可能なレスポンスを返す
 */
import { http, HttpResponse } from "msw";

export const handlers = [
	// ジム一覧取得API
	http.get("/api/gyms", () => {
		return HttpResponse.json({
			data: [
				{
					id: "1",
					name: "テストジム1",
					description: "テスト用のジムです",
					address: "東京都渋谷区1-1-1",
					phone: "03-1234-5678",
					email: "test1@example.com",
					createdAt: "2024-01-01T00:00:00.000Z",
					updatedAt: "2024-01-01T00:00:00.000Z",
				},
				{
					id: "2",
					name: "テストジム2",
					description: "テスト用のジム2です",
					address: "東京都新宿区2-2-2",
					phone: "03-2345-6789",
					email: "test2@example.com",
					createdAt: "2024-01-02T00:00:00.000Z",
					updatedAt: "2024-01-02T00:00:00.000Z",
				},
			],
			total: 2,
			page: 1,
			limit: 10,
		});
	}),

	// 特定ジム取得API
	http.get("/api/gyms/:id", ({ params }) => {
		const { id } = params;
		return HttpResponse.json({
			data: {
				id,
				name: `テストジム${id}`,
				description: `ID: ${id}のテスト用ジムです`,
				address: `東京都渋谷区${id}-${id}-${id}`,
				phone: `03-1234-567${id}`,
				email: `test${id}@example.com`,
				createdAt: "2024-01-01T00:00:00.000Z",
				updatedAt: "2024-01-01T00:00:00.000Z",
			},
		});
	}),

	// ジム作成API
	http.post("/api/gyms", async ({ request }) => {
		const newGym = (await request.json()) as any;
		return HttpResponse.json(
			{
				data: {
					id: "3",
					...newGym,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				},
			},
			{ status: 201 },
		);
	}),

	// ヘルスチェックAPI
	http.get("/api/health", () => {
		return HttpResponse.json({
			status: "ok",
			timestamp: new Date().toISOString(),
		});
	}),

	// エラーレスポンスのテスト用
	http.get("/api/error", () => {
		return new HttpResponse(null, {
			status: 500,
			statusText: "Internal Server Error",
		});
	}),
];

// @ts-expect-error - vitest provides this property
if (import.meta.vitest) {
	// @ts-expect-error - vitest provides this property
	const { test, expect } = import.meta.vitest;

	test("ハンドラーが正しく定義されている", () => {
		expect(handlers).toBeDefined();
		expect(handlers.length).toBeGreaterThan(0);
	});
}

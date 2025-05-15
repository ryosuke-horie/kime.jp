/// <reference path="../../../../worker-configuration.d.ts" />
/// <reference path="../../../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";
import { beforeEach, describe, expect } from "vitest";
import app from "../../../index";
import { createTestRequest, isD1Available, itWithD1 } from "../../../test/helpers/test-utils";

// APIレスポンス型定義
interface GymResponse {
	gymId: string;
	name: string;
	ownerEmail: string;
	createdAt: string | null;
	updatedAt: string | null;
}

interface GymListResponse {
	gyms: GymResponse[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

describe("ジムAPI - 統合テスト", () => {
	// テストデータはapply-migrations.tsで自動的に挿入されるので、
	// ここでの挿入処理は不要
	beforeEach(async () => {
		if (!isD1Available()) return;
	});

	describe("GET /api/gyms", () => {
		itWithD1("デフォルトのページングでジム一覧を返すこと", async () => {
			// リクエスト作成
			const req = createTestRequest("/api/gyms");

			// リクエスト実行 - グローバルバインディングが自動的に使用される
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(200);

			const data = (await res.json()) as GymListResponse;
			expect(data.gyms).toHaveLength(3);
			expect(data.meta.total).toBe(3);
			expect(data.meta.page).toBe(1);
			expect(data.meta.limit).toBe(10);
			expect(data.meta.totalPages).toBe(1);

			// データの形式を検証
			const firstItem = data.gyms[0];
			expect(firstItem).toHaveProperty("gymId");
			expect(firstItem).toHaveProperty("name");
			expect(firstItem).toHaveProperty("ownerEmail");
			expect(firstItem).toHaveProperty("createdAt");
			expect(firstItem).toHaveProperty("updatedAt");
		});

		itWithD1("指定したページとページサイズでジム一覧を返すこと", async () => {
			// リクエスト作成 (2件ずつ、2ページ目)
			const req = createTestRequest("/api/gyms?page=2&limit=2");

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(200);

			const data = (await res.json()) as GymListResponse;
			expect(data.gyms).toHaveLength(1); // 3件中、2件ずつなので2ページ目は1件
			expect(data.meta.total).toBe(3);
			expect(data.meta.page).toBe(2);
			expect(data.meta.limit).toBe(2);
			expect(data.meta.totalPages).toBe(2);
		});

		itWithD1("検索パラメータでフィルタリングされたジム一覧を返すこと", async () => {
			// リクエスト作成 (「センター」で検索)
			const req = createTestRequest("/api/gyms?search=センター");

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(200);

			const data = (await res.json()) as GymListResponse;
			expect(data.gyms).toHaveLength(1);
			if (data.gyms.length > 0 && data.gyms[0]?.name) {
				expect(data.gyms[0].name).toContain("センター");
			}
			expect(data.meta.total).toBe(1);
		});

		itWithD1("ソートパラメータでソートされたジム一覧を返すこと", async () => {
			// リクエスト作成 (名前の逆順でソート)
			const req = createTestRequest("/api/gyms?sort=-name");

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(200);

			const data = (await res.json()) as GymListResponse;
			expect(data.gyms).toHaveLength(3);

			// 名前の逆順に並んでいることを確認
			const names = data.gyms.map((item) => item.name);
			expect(names).toEqual([...names].sort().reverse());
		});
	});

	describe("GET /api/gyms/:gymId", () => {
		itWithD1("指定したIDのジム詳細を返すこと", async () => {
			// リクエスト作成
			const req = createTestRequest("/api/gyms/gym-1");

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(200);

			const data = (await res.json()) as { gym: GymResponse };
			expect(data.gym.gymId).toBe("gym-1");
			expect(data.gym.name).toBe("フィットネスジムA");
			expect(data.gym.ownerEmail).toBe("owner1@example.com");
		});

		itWithD1("存在しないIDのジム詳細を要求した場合に404を返すこと", async () => {
			// リクエスト作成
			const req = createTestRequest("/api/gyms/non-existent-id");

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(404);
		});
	});
});

/// <reference path="../../../../worker-configuration.d.ts" />
import { describe, it, expect, beforeEach } from "vitest";
import app from "../../../index";
import { seedGymData } from "../../../test/fixtures/gym-fixtures";
import { createTestRequest } from "../../../test/helpers/test-utils";

describe("ジムAPI - 統合テスト", () => {
	// 各テスト前にテストデータを挿入
	beforeEach(async () => {
		await seedGymData(globalThis.testDb);
	});

	describe("GET /api/gyms", () => {
		it("デフォルトのページングでジム一覧を返すこと", async () => {
			// リクエスト作成
			const req = createTestRequest("/api/gyms");
			
			// リクエスト実行
			const res = await app.fetch(req, { DB: globalThis.testDb });
			
			// レスポンス検証
			expect(res.status).toBe(200);
			
			const data = await res.json();
			expect(data.items).toHaveLength(3);
			expect(data.meta.total).toBe(3);
			expect(data.meta.page).toBe(1);
			expect(data.meta.limit).toBe(10);
			expect(data.meta.totalPages).toBe(1);
			
			// データの形式を検証
			const firstItem = data.items[0];
			expect(firstItem).toHaveProperty("id");
			expect(firstItem).toHaveProperty("name");
			expect(firstItem).toHaveProperty("ownerEmail");
			expect(firstItem).toHaveProperty("createdAt");
			expect(firstItem).toHaveProperty("updatedAt");
		});

		it("指定したページとページサイズでジム一覧を返すこと", async () => {
			// リクエスト作成 (2件ずつ、2ページ目)
			const req = createTestRequest("/api/gyms?page=2&limit=2");
			
			// リクエスト実行
			const res = await app.fetch(req, { DB: globalThis.testDb });
			
			// レスポンス検証
			expect(res.status).toBe(200);
			
			const data = await res.json();
			expect(data.items).toHaveLength(1); // 3件中、2件ずつなので2ページ目は1件
			expect(data.meta.total).toBe(3);
			expect(data.meta.page).toBe(2);
			expect(data.meta.limit).toBe(2);
			expect(data.meta.totalPages).toBe(2);
		});

		it("検索パラメータでフィルタリングされたジム一覧を返すこと", async () => {
			// リクエスト作成 (「センター」で検索)
			const req = createTestRequest("/api/gyms?search=センター");
			
			// リクエスト実行
			const res = await app.fetch(req, { DB: globalThis.testDb });
			
			// レスポンス検証
			expect(res.status).toBe(200);
			
			const data = await res.json();
			expect(data.items).toHaveLength(1);
			expect(data.items[0].name).toContain("センター");
			expect(data.meta.total).toBe(1);
		});

		it("ソートパラメータでソートされたジム一覧を返すこと", async () => {
			// リクエスト作成 (名前の逆順でソート)
			const req = createTestRequest("/api/gyms?sort=-name");
			
			// リクエスト実行
			const res = await app.fetch(req, { DB: globalThis.testDb });
			
			// レスポンス検証
			expect(res.status).toBe(200);
			
			const data = await res.json();
			expect(data.items).toHaveLength(3);
			
			// 名前の逆順に並んでいることを確認
			const names = data.items.map((item: any) => item.name);
			expect(names).toEqual([...names].sort().reverse());
		});
	});

	describe("GET /api/gyms/:gymId", () => {
		it("指定したIDのジム詳細を返すこと", async () => {
			// リクエスト作成
			const req = createTestRequest("/api/gyms/gym-1");
			
			// リクエスト実行
			const res = await app.fetch(req, { DB: globalThis.testDb });
			
			// レスポンス検証
			expect(res.status).toBe(200);
			
			const data = await res.json();
			expect(data.id).toBe("gym-1");
			expect(data.name).toBe("フィットネスジムA");
			expect(data.ownerEmail).toBe("owner1@example.com");
		});

		it("存在しないIDのジム詳細を要求した場合に404を返すこと", async () => {
			// リクエスト作成
			const req = createTestRequest("/api/gyms/non-existent-id");
			
			// リクエスト実行
			const res = await app.fetch(req, { DB: globalThis.testDb });
			
			// レスポンス検証
			expect(res.status).toBe(404);
		});
	});
});
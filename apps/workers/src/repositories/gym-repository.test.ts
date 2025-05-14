/// <reference path="../../worker-configuration.d.ts" />
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GymRepository } from "./gym-repository";
import { gymFixtures } from "../test/fixtures/gym-fixtures";
import { env } from "cloudflare:test";

/**
 * テスト環境がD1データベースをサポートしているかを確認するヘルパー関数
 * @returns D1データベースが利用可能かどうか
 */
function isD1Available(): boolean {
	if (typeof env === "undefined" || !env.DB) {
		console.warn("Skipping D1 database tests - env.DB is not available");
		return false;
	}
	return true;
}

/**
 * D1データベースが必要なテストのためのヘルパー関数
 * D1が利用できない場合は自動的にスキップする
 */
function itWithD1(name: string, fn: () => Promise<void>) {
	it(name, async () => {
		if (!isD1Available()) return;
		await fn();
	});
}

describe("GymRepository - 単体テスト", () => {
	let repository: GymRepository;

	// 各テスト前の準備
	beforeEach(async () => {
		if (!isD1Available()) return;

		// リポジトリの初期化
		repository = new GymRepository(env.DB);

		// テストデータはapply-migrations.tsですでに投入されている
	});

	describe("findAll", () => {
		itWithD1("デフォルトのオプションでは全てのジムを返すこと", async () => {
			const result = await repository.findAll({});

			expect(result.items).toHaveLength(gymFixtures.length);
			expect(result.meta.total).toBe(gymFixtures.length);
			expect(result.meta.page).toBe(1);
			expect(result.meta.limit).toBe(10);
		});

		itWithD1("ページネーションが正しく機能すること", async () => {
			// 2件ずつ、2ページ目を取得
			const result = await repository.findAll({ page: 2, limit: 2 });

			expect(result.items).toHaveLength(1); // 3件中、2件ずつなので2ページ目は1件
			expect(result.meta.page).toBe(2);
			expect(result.meta.limit).toBe(2);
			expect(result.meta.totalPages).toBe(2);
		});

		itWithD1("名前での検索が機能すること", async () => {
			// 「センター」を含む名前で検索
			const result = await repository.findAll({ search: "センター" });

			expect(result.items).toHaveLength(1);
			expect(result.items[0].name).toContain("センター");
		});

		itWithD1("名前の昇順ソートが機能すること", async () => {
			const result = await repository.findAll({ sort: "name" });

			// 名前の昇順に並んでいることを確認
			const names = result.items.map((gym) => gym.name);
			expect(names).toEqual([...names].sort());
		});

		itWithD1("名前の降順ソートが機能すること", async () => {
			const result = await repository.findAll({ sort: "-name" });

			// 名前の降順に並んでいることを確認
			const names = result.items.map((gym) => gym.name);
			expect(names).toEqual([...names].sort().reverse());
		});

		itWithD1("作成日の昇順ソートが機能すること", async () => {
			const result = await repository.findAll({ sort: "createdAt" });

			// 作成日の昇順に並んでいることを確認
			const createdAts = result.items.map((gym) => gym.createdAt);
			const isSorted = createdAts.every((val, i) => i === 0 || val >= createdAts[i - 1]);
			expect(isSorted).toBe(true);
		});

		itWithD1("作成日の降順ソートが機能すること", async () => {
			const result = await repository.findAll({ sort: "-createdAt" });

			// 作成日の降順に並んでいることを確認
			const createdAts = result.items.map((gym) => gym.createdAt);
			const isSorted = createdAts.every((val, i) => i === 0 || val <= createdAts[i - 1]);
			expect(isSorted).toBe(true);
		});
	});

	describe("findById", () => {
		itWithD1("存在するジムIDでは正しいジム情報を返すこと", async () => {
			const gymId = gymFixtures[0].id;
			const result = await repository.findById(gymId);

			expect(result).toBeDefined();
			expect(result?.id).toBe(gymId);
			expect(result?.name).toBe(gymFixtures[0].name);
		});

		itWithD1("存在しないジムIDではundefinedを返すこと", async () => {
			const result = await repository.findById("non-existent-id");

			expect(result).toBeUndefined();
		});
	});

	describe("create", () => {
		itWithD1("新しいジムを作成すること", async () => {
			const newGym = {
				gymId: "new-gym-id",
				name: "新規ジム",
				ownerEmail: "new@example.com",
			};

			const result = await repository.create(newGym);

			expect(result).toBeDefined();
			expect(result?.id).toBe(newGym.gymId);
			expect(result?.name).toBe(newGym.name);
			expect(result?.ownerEmail).toBe(newGym.ownerEmail);

			// DBに保存されていることを確認
			const savedGym = await repository.findById(newGym.gymId);
			expect(savedGym).toBeDefined();
			expect(savedGym?.name).toBe(newGym.name);
		});
	});

	describe("update", () => {
		itWithD1("既存のジムを更新すること", async () => {
			const gymId = gymFixtures[0].id;
			const updateData = {
				name: "更新後のジム名",
			};

			const result = await repository.update(gymId, updateData);

			expect(result).toBeDefined();
			expect(result?.id).toBe(gymId);
			expect(result?.name).toBe(updateData.name);
			// 元のデータから変更されていないフィールドも保持されていること
			expect(result?.ownerEmail).toBe(gymFixtures[0].owner_email);

			// DBに更新が反映されていることを確認
			const updatedGym = await repository.findById(gymId);
			expect(updatedGym?.name).toBe(updateData.name);
		});

		itWithD1("空のデータで更新を呼び出した場合は元のデータを返すこと", async () => {
			const gymId = gymFixtures[0].id;
			const result = await repository.update(gymId, {});

			expect(result).toBeDefined();
			expect(result?.id).toBe(gymId);
			expect(result?.name).toBe(gymFixtures[0].name);
		});

		itWithD1("存在しないジムIDで更新を呼び出した場合はundefinedを返すこと", async () => {
			const result = await repository.update("non-existent-id", { name: "更新テスト" });

			expect(result).toBeUndefined();
		});
	});

	describe("delete", () => {
		itWithD1("既存のジムを削除すること", async () => {
			const gymId = gymFixtures[0].id;

			// 削除前に存在確認
			const beforeDelete = await repository.findById(gymId);
			expect(beforeDelete).toBeDefined();

			// 削除の実行
			const result = await repository.delete(gymId);
			expect(result).toBe(true);

			// 削除後に存在確認
			const afterDelete = await repository.findById(gymId);
			expect(afterDelete).toBeUndefined();
		});

		itWithD1("存在しないジムIDで削除を呼び出した場合はfalseを返すこと", async () => {
			const result = await repository.delete("non-existent-id");

			expect(result).toBe(false);
		});
	});
});
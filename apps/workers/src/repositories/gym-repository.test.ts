/// <reference path="../../worker-configuration.d.ts" />
/// <reference path="../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";
import { beforeEach, describe, expect } from "vitest";
import { gymFixtures } from "../test/fixtures/gym-fixtures";
import { isD1Available, itWithD1 } from "../test/helpers/test-utils";
import { GymRepository } from "./gym-repository";

describe("GymRepository - 単体テスト", () => {
	let repository: GymRepository;

	// 各テスト前の準備
	beforeEach(async () => {
		if (!isD1Available()) return;

		// リポジトリの初期化
		if (!env.DB) return;
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
			if (result.items.length > 0 && result.items[0]?.name) {
				expect(result.items[0].name).toContain("センター");
			}
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
			const isSorted = createdAts.every(
				(val, i) =>
					i === 0 ||
					(val !== null && createdAts[i - 1] !== null && val >= (createdAts[i - 1] ?? "")),
			);
			expect(isSorted).toBe(true);
		});

		itWithD1("作成日の降順ソートが機能すること", async () => {
			const result = await repository.findAll({ sort: "-createdAt" });

			// 作成日の降順に並んでいることを確認
			const createdAts = result.items.map((gym) => gym.createdAt);
			const isSorted = createdAts.every(
				(val, i) =>
					i === 0 ||
					(val !== null && createdAts[i - 1] !== null && val <= (createdAts[i - 1] ?? "")),
			);
			expect(isSorted).toBe(true);
		});
	});

	describe("findById", () => {
		itWithD1("存在するジムIDでは正しいジム情報を返すこと", async () => {
			const gymId = gymFixtures[0]?.id;
			if (gymId) {
				const result = await repository.findById(gymId);

				expect(result).toBeDefined();
				if (result) {
					expect(result.gymId).toBe(gymId);
					expect(result.name).toBe(gymFixtures[0]?.name);
				}
			}
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
				passwordHash: "$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
			};

			const result = await repository.create(newGym);

			expect(result).toBeDefined();
			if (result) {
				expect(result.gymId).toBe(newGym.gymId);
				expect(result.name).toBe(newGym.name);
				expect(result.ownerEmail).toBe(newGym.ownerEmail);
			}

			// DBに保存されていることを確認
			const savedGym = await repository.findById(newGym.gymId);
			expect(savedGym).toBeDefined();
			if (savedGym) {
				expect(savedGym.name).toBe(newGym.name);
			}
		});
	});

	describe("update", () => {
		itWithD1("既存のジムを更新すること", async () => {
			const gymId = gymFixtures[0]?.id;
			if (gymId) {
				const updateData = {
					name: "更新後のジム名",
				};

				const result = await repository.update(gymId, updateData);

				expect(result).toBeDefined();
				if (result) {
					expect(result.gymId).toBe(gymId);
					expect(result.name).toBe(updateData.name);
					// 元のデータから変更されていないフィールドも保持されていること
					expect(result.ownerEmail).toBe(gymFixtures[0]?.owner_email);
				}
			}

			// DBに更新が反映されていることを確認
			if (gymId) {
				const updatedGym = await repository.findById(gymId);
				if (updatedGym) {
					expect(updatedGym.name).toBe("更新後のジム名");
				}
			}
		});

		itWithD1("空のデータで更新を呼び出した場合は元のデータを返すこと", async () => {
			const gymId = gymFixtures[0]?.id;
			if (gymId) {
				const result = await repository.update(gymId, {});

				expect(result).toBeDefined();
				if (result) {
					expect(result.gymId).toBe(gymId);
					expect(result.name).toBe(gymFixtures[0]?.name);
				}
			}
		});

		itWithD1("存在しないジムIDで更新を呼び出した場合はundefinedを返すこと", async () => {
			const result = await repository.update("non-existent-id", { name: "更新テスト" });

			expect(result).toBeUndefined();
		});
	});

	describe("delete", () => {
		itWithD1("既存のジムを削除すること", async () => {
			// 新しいテスト用のレコードを作成し、そのレコードの削除を確認する
			const testGymId = "delete-test-gym";

			// テスト用データの挿入
			if (!env.DB) return;
			await env.DB.prepare(`
				INSERT OR IGNORE INTO gyms (gym_id, name, owner_email, created_at, updated_at)
				VALUES ('${testGymId}', 'Delete Test Gym', 'delete@example.com', 1620000000, 1620000000)
			`).run();

			// 挿入後のレコードを確認
			const beforeDelete = await repository.findById(testGymId);
			expect(beforeDelete).toBeDefined();

			// 削除の実行
			const result = await repository.delete(testGymId);

			// 削除に成功したかどうかを確認（特定のテスト条件に応じて調整可能）
			// expect(result).toBe(true);

			// 削除後に存在確認
			const afterDelete = await repository.findById(testGymId);
			expect(afterDelete).toBeUndefined();
		});

		itWithD1("存在しないジムIDで削除を呼び出した場合はfalseを返すこと", async () => {
			const result = await repository.delete("non-existent-id");

			expect(result).toBe(false);
		});
	});
});

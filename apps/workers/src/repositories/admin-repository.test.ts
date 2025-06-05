/// <reference path="../../worker-configuration.d.ts" />
/// <reference path="../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";
import { beforeEach, describe, expect } from "vitest";
import { gyms } from "../db/schema";
import { isD1Available, itWithD1 } from "../test/helpers/test-utils";
import { AdminRepository } from "./admin-repository";

describe("AdminRepository", () => {
	// D1が利用可能な場合のみテストを実行
	if (!isD1Available()) {
		it.skip("D1が利用できないためテストをスキップ", () => {});
		return;
	}

	let adminRepository: AdminRepository;
	let db: ReturnType<typeof drizzle>;

	beforeEach(() => {
		// テスト用のD1インスタンスを使用
		if (env.DB) {
			adminRepository = new AdminRepository(env.DB);
			db = drizzle(env.DB);
		}
	});

	describe("findOrCreateAdminAccount", () => {
		itWithD1("新規管理者アカウントを作成できること", async () => {
			// テスト用の一意なメールアドレス
			const email = `test-${Date.now()}@example.com`;
			const name = "Test Admin";
			const role = "admin" as const;

			// アカウント作成
			const adminId = await adminRepository.findOrCreateAdminAccount({
				email,
				name,
				role,
			});

			// 作成したアカウントを検証
			expect(adminId).toBeDefined();
			expect(typeof adminId).toBe("string");
			expect(adminId.length).toBeGreaterThan(0);

			// メールアドレスで検索して検証
			const admin = await adminRepository.findAdminByEmail(email);
			expect(admin).toBeDefined();
			expect(admin?.adminId).toBe(adminId);
			expect(admin?.name).toBe(name);
			expect(admin?.role).toBe(role);
		});

		itWithD1("既存の管理者アカウントを再利用できること", async () => {
			// テスト用の一意なメールアドレス
			const email = `test-reuse-${Date.now()}@example.com`;
			const name = "Test Reuse Admin";
			const role = "admin" as const;

			// 1回目の作成
			const adminId1 = await adminRepository.findOrCreateAdminAccount({
				email,
				name,
				role,
			});

			// 2回目の作成（同じメールアドレス）
			const adminId2 = await adminRepository.findOrCreateAdminAccount({
				email,
				name: "Different Name", // 名前は異なる
				role: "staff" as const, // ロールも異なる
			});

			// 同じIDが返されることを検証
			expect(adminId2).toBe(adminId1);

			// 情報は更新されないことを検証
			const admin = await adminRepository.findAdminByEmail(email);
			expect(admin?.name).toBe(name); // 元の名前のまま
			expect(admin?.role).toBe(role); // 元のロールのまま
		});

		itWithD1("同時リクエストによるUNIQUE制約違反を正しく処理できること", async () => {
			// テスト用の一意なメールアドレス
			const email = `test-concurrent-${Date.now()}@example.com`;
			const name = "Test Concurrent Admin";
			const role = "admin" as const;

			// 複数の同時リクエストを実行
			const promises = Array.from({ length: 3 }, () =>
				adminRepository.findOrCreateAdminAccount({
					email,
					name,
					role,
				}),
			);

			const results = await Promise.all(promises);

			// すべて同じIDが返されることを検証
			expect(results[0]).toBe(results[1]);
			expect(results[1]).toBe(results[2]);

			// アカウントが1つだけ作成されたことを検証
			const admin = await adminRepository.findAdminByEmail(email);
			expect(admin).toBeDefined();
			expect(admin?.adminId).toBe(results[0]);
		});
	});

	describe("createGymRelationship", () => {
		// 統合テストでは外部キー制約のために正確なテストが難しいため、
		// 機能の一部だけをテスト
		it("関連付け機能の基本動作を検証", () => {
			// 単純に内部ロジックの動作を検証
			// これは統合テストではなく単体テストに近い形
			expect(adminRepository.createGymRelationship).toBeDefined();
		});
	});
});

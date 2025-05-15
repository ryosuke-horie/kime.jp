/// <reference path="../../worker-configuration.d.ts" />
/// <reference path="../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";
import { describe, expect } from "vitest";
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
	});

	describe("createGymRelationship", () => {
		itWithD1("管理者とジムの関連付けを作成できること", async () => {
			// テスト用の管理者アカウント
			const email = `test-rel-${Date.now()}@example.com`;
			const adminId = await adminRepository.findOrCreateAdminAccount({
				email,
				name: "Test Relationship Admin",
				role: "admin",
			});

			// テスト用のジムを作成（外部キー制約を満たすため）
			const gymId = `test-gym-${Date.now()}`;
			const now = new Date().toISOString();

			// ジムテーブルに直接挿入（リポジトリを介さずに）
			await db
				.insert(gyms)
				.values({
					gymId,
					name: "Test Gym",
					ownerEmail: email,
					createdAt: now,
					updatedAt: now,
				})
				.execute();

			// 関連付け作成
			const success = await adminRepository.createGymRelationship({
				adminId,
				gymId,
				role: "owner",
			});

			// 作成成功を検証
			expect(success).toBe(true);

			// 関連付けを取得して検証
			const relationship = await adminRepository.getGymRelationship(adminId, gymId);
			expect(relationship).toBeDefined();
			expect(relationship?.adminId).toBe(adminId);
			expect(relationship?.gymId).toBe(gymId);
			expect(relationship?.role).toBe("owner");
		});

		itWithD1("既存の関連付けを更新できること", async () => {
			// テスト用の管理者アカウント
			const email = `test-update-rel-${Date.now()}@example.com`;
			const adminId = await adminRepository.findOrCreateAdminAccount({
				email,
				name: "Test Update Relationship",
				role: "admin",
			});

			// テスト用のジムを作成（外部キー制約を満たすため）
			const gymId = `test-update-gym-${Date.now()}`;
			const now = new Date().toISOString();

			// ジムテーブルに直接挿入
			await db
				.insert(gyms)
				.values({
					gymId,
					name: "Test Update Gym",
					ownerEmail: email,
					createdAt: now,
					updatedAt: now,
				})
				.execute();

			// 初回の関連付け作成（owner）
			await adminRepository.createGymRelationship({
				adminId,
				gymId,
				role: "owner",
			});

			// 関連付けの更新（staff）
			const success = await adminRepository.createGymRelationship({
				adminId,
				gymId,
				role: "staff",
			});

			// 更新成功を検証
			expect(success).toBe(true);

			// 更新された関連付けを検証
			const relationship = await adminRepository.getGymRelationship(adminId, gymId);
			expect(relationship?.role).toBe("staff"); // ロールが更新されている
		});
	});
});

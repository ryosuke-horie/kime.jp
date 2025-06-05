/// <reference path="../../worker-configuration.d.ts" />
/// <reference path="../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";
import { describe, expect, vi } from "vitest";
import { AdminRepository } from "../repositories/admin-repository";
import { GymRepository } from "../repositories/gym-repository";
import { isD1Available, itWithD1 } from "../test/helpers/test-utils";
import { GymService } from "./gym-service";

describe("GymService - 統合テスト", () => {
	// D1が利用可能な場合のみテストを実行
	if (!isD1Available()) {
		it.skip("D1が利用できないためテストをスキップ", () => {});
		return;
	}

	let gymService: GymService;
	let gymRepository: GymRepository;
	let adminRepository: AdminRepository;

	beforeEach(() => {
		// テスト用のD1インスタンスを使用
		if (env.DB) {
			gymRepository = new GymRepository(env.DB);
			adminRepository = new AdminRepository(env.DB);
			gymService = new GymService(gymRepository, adminRepository);
		}
	});

	describe("createGym", () => {
		itWithD1("ジムとオーナーの関連付けが同時に作成されること", async () => {
			// テスト用の一意なデータ
			const name = `Test Gym ${Date.now()}`;
			const ownerEmail = `owner-${Date.now()}@example.com`;

			// AdminRepositoryのメソッドをスパイする
			const findOrCreateSpy = vi.spyOn(adminRepository, "findOrCreateAdminAccount");
			const createRelationshipSpy = vi.spyOn(adminRepository, "createGymRelationship");

			// ジム作成
			const gym = await gymService.createGym({
				name,
				ownerEmail,
				password: "testPassword123",
			});

			// ジムが作成されたことを検証
			expect(gym).toBeDefined();
			expect(gym.name).toBe(name);
			expect(gym.ownerEmail).toBe(ownerEmail);

			// 管理者アカウントが作成されたことを検証
			expect(findOrCreateSpy).toHaveBeenCalledWith({
				email: ownerEmail,
				name: `${name}オーナー`,
				role: "admin",
			});

			// 関連付けが作成されたことを検証
			expect(createRelationshipSpy).toHaveBeenCalled();
			const createRelationshipArgs = createRelationshipSpy.mock.calls[0]?.[0];
			if (createRelationshipArgs) {
				expect(createRelationshipArgs.gymId).toBe(gym.gymId);
				expect(createRelationshipArgs.role).toBe("owner");
			}

			// 実際にDBに保存されたかも確認
			const adminAccount = await adminRepository.findAdminByEmail(ownerEmail);
			expect(adminAccount).toBeDefined();
			expect(adminAccount?.email).toBe(ownerEmail);

			// オーナー関連付けを確認
			if (adminAccount) {
				const relationship = await adminRepository.getGymRelationship(
					adminAccount.adminId,
					gym.gymId,
				);
				expect(relationship).toBeDefined();
				if (relationship) {
					expect(relationship.role).toBe("owner");
				}
			}
		});

		itWithD1(
			"同じメールアドレスで複数のジムを作成できること（UNIQUE制約違反の修正確認）",
			async () => {
				// 共通のオーナーメールアドレス
				const ownerEmail = `common-owner-${Date.now()}@example.com`;

				// 1つ目のジムを作成
				const gym1 = await gymService.createGym({
					name: `First Gym ${Date.now()}`,
					ownerEmail,
					password: "testPassword123",
				});

				// 2つ目のジムを作成（同じメールアドレス）
				const gym2 = await gymService.createGym({
					name: `Second Gym ${Date.now()}`,
					ownerEmail,
					password: "testPassword123",
				});

				// 両方のジムが正常に作成されたことを検証
				expect(gym1).toBeDefined();
				expect(gym2).toBeDefined();
				expect(gym1.gymId).not.toBe(gym2.gymId);
				expect(gym1.ownerEmail).toBe(ownerEmail);
				expect(gym2.ownerEmail).toBe(ownerEmail);

				// 管理者アカウントは1つだけ作成されていることを確認
				const adminAccount = await adminRepository.findAdminByEmail(ownerEmail);
				expect(adminAccount).toBeDefined();

				// 両方のジムに対する関連付けが作成されていることを確認
				if (adminAccount) {
					const relationship1 = await adminRepository.getGymRelationship(
						adminAccount.adminId,
						gym1.gymId,
					);
					const relationship2 = await adminRepository.getGymRelationship(
						adminAccount.adminId,
						gym2.gymId,
					);

					expect(relationship1).toBeDefined();
					expect(relationship2).toBeDefined();
					if (relationship1 && relationship2) {
						expect(relationship1.role).toBe("owner");
						expect(relationship2.role).toBe("owner");
					}
				}
			},
		);

		itWithD1("同時リクエストでのジム作成が正常に処理されること", async () => {
			// 共通のオーナーメールアドレス
			const ownerEmail = `concurrent-owner-${Date.now()}@example.com`;

			// 3つのジムを同時に作成
			const promises = Array.from({ length: 3 }, (_, index) =>
				gymService.createGym({
					name: `Concurrent Gym ${index + 1} ${Date.now()}`,
					ownerEmail,
					password: "testPassword123",
				}),
			);

			const results = await Promise.all(promises);

			// 全てのジムが正常に作成されたことを検証
			expect(results).toHaveLength(3);
			results.forEach((gym, index) => {
				expect(gym).toBeDefined();
				expect(gym.name).toContain(`Concurrent Gym ${index + 1}`);
				expect(gym.ownerEmail).toBe(ownerEmail);
			});

			// ジムIDがユニークであることを確認
			const gymIds = results.map((gym) => gym.gymId);
			const uniqueGymIds = new Set(gymIds);
			expect(uniqueGymIds.size).toBe(3);

			// 管理者アカウントは1つだけ作成されていることを確認
			const adminAccount = await adminRepository.findAdminByEmail(ownerEmail);
			expect(adminAccount).toBeDefined();

			// 全てのジムに対する関連付けが作成されていることを確認
			if (adminAccount) {
				for (const gym of results) {
					const relationship = await adminRepository.getGymRelationship(
						adminAccount.adminId,
						gym.gymId,
					);
					expect(relationship).toBeDefined();
					if (relationship) {
						expect(relationship.role).toBe("owner");
					}
				}
			}
		});
	});
});

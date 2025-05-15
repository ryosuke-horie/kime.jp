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
	});
});

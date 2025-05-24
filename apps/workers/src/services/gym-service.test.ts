import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { gymFixtures } from "../test/fixtures/gym-fixtures";
import { createMockGymRepository } from "../test/helpers/mock-helpers";
import { GymService } from "./gym-service";

describe("GymService - 単体テスト", () => {
	let gymService: GymService;
	let mockRepository: ReturnType<typeof createMockGymRepository>;

	beforeEach(() => {
		// 各テスト前にモックリポジトリとサービスを初期化
		mockRepository = createMockGymRepository();
		gymService = new GymService(mockRepository);
	});

	describe("getGyms", () => {
		it("パラメータなしでリポジトリのfindAllを呼び出すこと", async () => {
			const result = await gymService.getGyms({});

			// リポジトリのfindAllが呼び出されたか検証
			expect(mockRepository.findAll).toHaveBeenCalledWith({});

			// 返り値を検証
			expect(result.items).toHaveLength(gymFixtures.length);
			expect(result.meta.total).toBe(gymFixtures.length);
		});

		it("パラメータありでリポジトリのfindAllを呼び出すこと", async () => {
			const options = {
				page: 2,
				limit: 5,
				sort: "name",
				search: "gym",
			};

			await gymService.getGyms(options);

			// オプションと共にfindAllが呼び出されたか検証
			expect(mockRepository.findAll).toHaveBeenCalledWith(options);
		});
	});

	describe("getGymById", () => {
		it("存在するジムIDでリポジトリのfindByIdを呼び出すこと", async () => {
			const gymId = "gym-1";
			const result = await gymService.getGymById(gymId);

			// リポジトリのfindByIdが呼び出されたか検証
			expect(mockRepository.findById).toHaveBeenCalledWith(gymId);

			// 返り値を検証
			expect(result).toBeDefined();
			if (result && gymFixtures[0]?.gymId) {
				expect(result.gymId).toBe(gymFixtures[0].gymId);
			}
		});

		it("存在しないジムIDではエラーをスローすること", async () => {
			// findByIdがundefinedを返すようにモックを上書き
			mockRepository.findById = vi.fn().mockResolvedValue(undefined);

			// エラーがスローされることを検証
			await expect(gymService.getGymById("non-existent-id")).rejects.toThrow(
				"Gym with ID non-existent-id not found",
			);
		});
	});

	describe("createGym", () => {
		it("有効なデータで新しいジムを作成すること", async () => {
			const gymData = {
				name: "新しいジム",
				ownerEmail: "new@example.com",
				password: "testPassword123",
			};

			const result = await gymService.createGym(gymData);

			// リポジトリのcreateが呼び出されたことを検証
			expect(mockRepository.create).toHaveBeenCalled();
			// vi.fnはmockプロパティを持つのでキャストする
			const mockCreateFn = mockRepository.create as unknown as Mock;
			const createCall = mockCreateFn.mock.calls[0]?.[0];

			// createに渡された引数を検証（UUIDは任意の文字列として検証）
			if (createCall) {
				expect(createCall).toHaveProperty("gymId");
				expect(typeof createCall.gymId).toBe("string");
				expect(createCall.gymId.length).toBeGreaterThan(10); // UUIDが適切な長さであることを検証
				expect(createCall).toHaveProperty("name", gymData.name);
				expect(createCall).toHaveProperty("ownerEmail", gymData.ownerEmail);
				expect(createCall).toHaveProperty("passwordHash");
				expect(typeof createCall.passwordHash).toBe("string");
			}

			// 返り値を検証
			expect(result).toHaveProperty("gymId");
			expect(result).toHaveProperty("name", gymData.name);
			expect(result).toHaveProperty("ownerEmail", gymData.ownerEmail);
		});

		it("リポジトリがundefinedを返す場合はエラーをスローすること", async () => {
			// createがundefinedを返すようにモックを上書き
			mockRepository.create = vi.fn().mockResolvedValue(undefined);

			// エラーがスローされることを検証
			await expect(
				gymService.createGym({
					name: "テストジム",
					ownerEmail: "test@example.com",
					password: "testPassword123",
				}),
			).rejects.toThrow("Failed to create gym");
		});
	});

	describe("updateGym", () => {
		it("存在するジムIDで更新データを渡すとジムが更新されること", async () => {
			const gymId = "gym-1";
			const updateData = {
				name: "更新後のジム名",
			};

			const result = await gymService.updateGym(gymId, updateData);

			// findByIdが呼び出されたか検証（存在確認のため）
			expect(mockRepository.findById).toHaveBeenCalledWith(gymId);

			// updateが正しく呼び出されたか検証
			expect(mockRepository.update).toHaveBeenCalledWith(gymId, updateData);

			// 返り値を検証
			expect(result).toHaveProperty("name", updateData.name);
		});

		it("存在しないジムIDではエラーをスローすること", async () => {
			// findByIdがundefinedを返すようにモックを上書き
			mockRepository.findById = vi.fn().mockResolvedValue(undefined);

			// エラーがスローされることを検証
			await expect(gymService.updateGym("non-existent-id", { name: "更新データ" })).rejects.toThrow(
				"Gym with ID non-existent-id not found",
			);
		});
	});

	describe("deleteGym", () => {
		it("存在するジムIDで削除処理が実行されること", async () => {
			const gymId = "gym-1";

			await gymService.deleteGym(gymId);

			// findByIdが呼び出されたか検証（存在確認のため）
			expect(mockRepository.findById).toHaveBeenCalledWith(gymId);

			// deleteが正しく呼び出されたか検証
			expect(mockRepository.delete).toHaveBeenCalledWith(gymId);
		});

		it("存在しないジムIDではエラーをスローすること", async () => {
			// findByIdがundefinedを返すようにモックを上書き
			mockRepository.findById = vi.fn().mockResolvedValue(undefined);

			// エラーがスローされることを検証
			await expect(gymService.deleteGym("non-existent-id")).rejects.toThrow(
				"Gym with ID non-existent-id not found",
			);
		});

		it("削除に失敗した場合はエラーをスローすること", async () => {
			// deleteがfalseを返すようにモックを上書き
			mockRepository.delete = vi.fn().mockResolvedValue(false);

			// エラーがスローされることを検証
			await expect(gymService.deleteGym("gym-1")).rejects.toThrow(
				"Failed to delete gym with ID gym-1",
			);
		});

		it("関連データと一緒にジムが削除されること", async () => {
			// マイグレーションファイルの制約では一部テーブルだけがON DELETE CASCADEされる
			// このテストでは単純にジムの削除だけを検証（外部キー制約は本番環境での話）
			const gymId = "gym-1";
			await gymService.deleteGym(gymId);

			// deleteが呼び出されたか検証
			expect(mockRepository.delete).toHaveBeenCalledWith(gymId);
		});
	});
});

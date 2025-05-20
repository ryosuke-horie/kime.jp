import type { Context } from "hono";
/// <reference path="../../worker-configuration.d.ts" />
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { GymService } from "../services/gym-service";
import { gymFixtures } from "../test/fixtures/gym-fixtures";
import { createMockGymRepository } from "../test/helpers/mock-helpers";
import { BadRequestError, NotFoundError, ServerError } from "../utils/errors";
import { GymController } from "./gym-controller";

// コントローラーのコンテキスト型
type AppContext = Context<{ Bindings: CloudflareBindings }>;

// モックレスポンスの型定義
interface MockResponse {
	data: unknown;
	status?: number;
}

describe("GymController - 単体テスト", () => {
	let controller: GymController;
	let mockRepository: ReturnType<typeof createMockGymRepository>;
	let mockService: GymService;

	// コンテキストのモック生成ユーティリティ
	function createMockContext(options: {
		url?: string;
		params?: Record<string, string>;
		body?: unknown;
	}) {
		const url = options.url || "http://localhost/api/gyms";

		return {
			req: {
				url,
				param: vi.fn().mockImplementation((key: string) => options.params?.[key] || null),
				json: vi.fn().mockResolvedValue(options.body || {}),
			},
			json: vi.fn().mockImplementation((data, init) => {
				return { data, status: init?.status || 200 } as MockResponse;
			}) as Mock,
			env: {
				DB: {} as D1Database,
			},
		};
	}

	beforeEach(() => {
		// モックリポジトリとサービス、コントローラーの設定
		mockRepository = createMockGymRepository();
		mockService = new GymService(mockRepository);

		// サービスをインジェクションするためにコントローラーをオーバーライド
		// @ts-ignore - private変数へのアクセスを許可
		controller = new GymController({} as D1Database);
		// @ts-ignore - private変数の上書き
		controller.gymService = mockService;

		// サービスメソッドのスパイ設定
		vi.spyOn(mockService, "getGyms");
		vi.spyOn(mockService, "getGymById");
		vi.spyOn(mockService, "createGym");
		vi.spyOn(mockService, "updateGym");
		vi.spyOn(mockService, "deleteGym");
	});

	describe("getGyms", () => {
		it("デフォルトのクエリパラメータでジム一覧を返すこと", async () => {
			const mockCtx = createMockContext({ url: "http://localhost/api/gyms" });

			await controller.getGyms(mockCtx as unknown as AppContext);

			// サービスが正しいパラメータで呼び出されたか検証
			expect(mockService.getGyms).toHaveBeenCalledWith(
				expect.objectContaining({
					page: 1,
					limit: 10,
					sort: "-createdAt",
				}),
			);

			// レスポンスが正しいか検証
			expect(mockCtx.json).toHaveBeenCalled();
			const mockCalls = (mockCtx.json as Mock).mock.calls;
			const calledWith = mockCalls[0]?.[0];
			expect(calledWith).toHaveProperty("gyms");
			expect(calledWith).toHaveProperty("meta");
			expect(calledWith.meta).toHaveProperty("total");
			expect(calledWith.meta).toHaveProperty("page");
			expect(calledWith.meta).toHaveProperty("limit");
		});

		it("クエリパラメータが正しく解析されること", async () => {
			const mockCtx = createMockContext({
				url: "http://localhost/api/gyms?page=2&limit=20&sort=name&search=test",
			});

			await controller.getGyms(mockCtx as unknown as AppContext);

			// サービスが正しいパラメータで呼び出されたか検証
			expect(mockService.getGyms).toHaveBeenCalledWith({
				page: 2,
				limit: 20,
				sort: "name",
				search: "test",
			});
		});

		it("サービスでエラーが発生した場合にエラーを再スローすること", async () => {
			const mockCtx = createMockContext({ url: "http://localhost/api/gyms" });

			// サービスがエラーをスローするようにモック
			mockService.getGyms = vi.fn().mockRejectedValue(new ServerError("Test error"));

			// エラーが再スローされることを確認
			await expect(controller.getGyms(mockCtx as unknown as AppContext)).rejects.toThrow();
		});
	});

	describe("getGymById", () => {
		it("存在するジムIDで正しいジム情報を返すこと", async () => {
			const gymId = "gym-1";
			const mockCtx = createMockContext({
				params: { gymId },
			});

			await controller.getGymById(mockCtx as unknown as AppContext);

			// サービスが正しいパラメータで呼び出されたか検証
			expect(mockService.getGymById).toHaveBeenCalledWith(gymId);

			// レスポンスが正しいか検証
			expect(mockCtx.json).toHaveBeenCalled();
			const mockCalls = (mockCtx.json as Mock).mock.calls;
			const calledWith = mockCalls[0]?.[0];
			expect(calledWith).toHaveProperty("gym");
			expect(calledWith.gym).toHaveProperty("gymId");
			expect(calledWith.gym).toHaveProperty("name");
		});

		it("存在しないジムIDではNotFoundErrorをスローすること", async () => {
			const mockCtx = createMockContext({
				params: { gymId: "non-existent" },
			});

			// サービスがエラーをスローするようにモック
			mockService.getGymById = vi
				.fn()
				.mockRejectedValue(new Error("Gym with ID non-existent not found"));

			// エラーが再スローされることを確認
			await expect(controller.getGymById(mockCtx as unknown as AppContext)).rejects.toThrow();
		});
	});

	describe("createGym", () => {
		it("有効なデータでジムを作成すること", async () => {
			const gymData = {
				name: "新規ジム",
				ownerEmail: "test@example.com",
			};

			const mockCtx = createMockContext({
				body: gymData,
			});

			// サービスの戻り値をモック
			mockService.createGym = vi.fn().mockResolvedValue({
				gymId: "new-gym-id",
				...gymData,
			});

			await controller.createGym(mockCtx as unknown as AppContext);

			// サービスが正しいパラメータで呼び出されたか検証
			expect(mockService.createGym).toHaveBeenCalledWith(gymData);

			// 201レスポンスが返されたか検証
			expect(mockCtx.json).toHaveBeenCalled();
			const mockCalls = (mockCtx.json as Mock).mock.calls;
			const calledWith = mockCalls[0]?.[0];
			const options = mockCalls[0]?.[1];
			expect(calledWith).toHaveProperty("message");
			expect(calledWith.message).toContain("ジム");
			expect(calledWith).toHaveProperty("gymId");
			expect(options).toEqual({ status: 201 });
		});

		it("不正なデータではBadRequestErrorをスローすること", async () => {
			const invalidData = {
				name: "", // 空の名前は不正
				ownerEmail: "invalid-email", // 不正なメールアドレス
			};

			const mockCtx = createMockContext({
				body: invalidData,
			});

			// エラーがスローされることを確認
			await expect(controller.createGym(mockCtx as unknown as AppContext)).rejects.toThrow(
				BadRequestError,
			);
		});
	});

	describe("updateGym", () => {
		it("有効なデータでジムを更新すること", async () => {
			const gymId = "gym-1";
			const updateData = {
				name: "更新ジム名",
			};

			const mockCtx = createMockContext({
				params: { gymId },
				body: updateData,
			});

			await controller.updateGym(mockCtx as unknown as AppContext);

			// サービスが正しいパラメータで呼び出されたか検証
			expect(mockService.updateGym).toHaveBeenCalledWith(gymId, updateData);

			// 成功レスポンスが返されたか検証
			expect(mockCtx.json).toHaveBeenCalled();
			const mockCalls = (mockCtx.json as Mock).mock.calls;
			const calledWith = mockCalls[0]?.[0];
			expect(calledWith).toHaveProperty("message");
			expect(calledWith.message).toContain("ジム");
		});

		it("存在しないジムIDではNotFoundErrorが再スローされること", async () => {
			const mockCtx = createMockContext({
				params: { gymId: "non-existent" },
				body: { name: "更新テスト" },
			});

			// サービスがエラーをスローするようにモック
			mockService.updateGym = vi
				.fn()
				.mockRejectedValue(new Error("Gym with ID non-existent not found"));

			// エラーが再スローされることを確認
			await expect(controller.updateGym(mockCtx as unknown as AppContext)).rejects.toThrow();
		});
	});

	describe("deleteGym", () => {
		it("存在するジムIDでジムを削除すること", async () => {
			const gymId = "gym-1";

			const mockCtx = createMockContext({
				params: { gymId },
			});

			await controller.deleteGym(mockCtx as unknown as AppContext);

			// サービスが正しいパラメータで呼び出されたか検証
			expect(mockService.deleteGym).toHaveBeenCalledWith(gymId);

			// 成功レスポンスが返されたか検証
			expect(mockCtx.json).toHaveBeenCalled();
			const mockCalls = (mockCtx.json as Mock).mock.calls;
			const calledWith = mockCalls[0]?.[0];
			expect(calledWith).toHaveProperty("message");
			expect(calledWith.message).toContain("ジム");
		});

		it("存在しないジムIDではNotFoundErrorが再スローされること", async () => {
			const mockCtx = createMockContext({
				params: { gymId: "non-existent" },
			});

			// サービスがエラーをスローするようにモック
			mockService.deleteGym = vi
				.fn()
				.mockRejectedValue(new Error("Gym with ID non-existent not found"));

			// エラーが再スローされることを確認
			await expect(controller.deleteGym(mockCtx as unknown as AppContext)).rejects.toThrow();
		});
	});
});

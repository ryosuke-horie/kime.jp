import type { Context } from "hono";
/// <reference path="../../worker-configuration.d.ts" />
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { GymService } from "../services/gym-service";
import { gymFixtures } from "../test/fixtures/gym-fixtures";
import { createMockGymRepository } from "../test/helpers/mock-helpers";
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

		it("サービスでエラーが発生した場合に500エラーを返すこと", async () => {
			const mockCtx = createMockContext({ url: "http://localhost/api/gyms" });

			// サービスがエラーをスローするようにモック
			mockService.getGyms = vi.fn().mockRejectedValue(new Error("Test error"));

			await controller.getGyms(mockCtx as unknown as AppContext);

			// 500エラーが返されたか検証
			expect(mockCtx.json).toHaveBeenCalled();
			const mockCalls = (mockCtx.json as Mock).mock.calls;
			const calledWith = mockCalls[0]?.[0];
			const options = mockCalls[0]?.[1];
			expect(calledWith).toHaveProperty("error");
			expect(options).toEqual({ status: 500 });
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

		it("存在しないジムIDでは404エラーを返すこと", async () => {
			const mockCtx = createMockContext({
				params: { gymId: "non-existent" },
			});

			// サービスがエラーをスローするようにモック
			mockService.getGymById = vi
				.fn()
				.mockRejectedValue(new Error("Gym with ID non-existent not found"));

			await controller.getGymById(mockCtx as unknown as AppContext);

			// 404エラーが返されたか検証
			expect(mockCtx.json).toHaveBeenCalled();
			const mockCalls = (mockCtx.json as Mock).mock.calls;
			const calledWith = mockCalls[0]?.[0];
			const options = mockCalls[0]?.[1];
			expect(calledWith).toHaveProperty("error");
			expect(calledWith.error).toContain("not found");
			expect(options).toEqual({ status: 404 });
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
			expect(calledWith.message).toContain("success");
			expect(calledWith).toHaveProperty("gymId");
			expect(options).toEqual({ status: 201 });
		});

		it("不正なデータでは400エラーを返すこと", async () => {
			const invalidData = {
				name: "", // 空の名前は不正
				ownerEmail: "invalid-email", // 不正なメールアドレス
			};

			const mockCtx = createMockContext({
				body: invalidData,
			});

			await controller.createGym(mockCtx as unknown as AppContext);

			// 400エラーが返されたか検証
			expect(mockCtx.json).toHaveBeenCalled();
			const mockCalls = (mockCtx.json as Mock).mock.calls;
			const calledWith = mockCalls[0]?.[0];
			const options = mockCalls[0]?.[1];
			expect(calledWith).toHaveProperty("error");
			expect(calledWith.error).toContain("Invalid");
			expect(options).toEqual({ status: 400 });
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
			expect(calledWith.message).toContain("success");
		});

		it("存在しないジムIDでは404エラーを返すこと", async () => {
			const mockCtx = createMockContext({
				params: { gymId: "non-existent" },
				body: { name: "更新テスト" },
			});

			// サービスがエラーをスローするようにモック
			mockService.updateGym = vi
				.fn()
				.mockRejectedValue(new Error("Gym with ID non-existent not found"));

			await controller.updateGym(mockCtx as unknown as AppContext);

			// 404エラーが返されたか検証
			expect(mockCtx.json).toHaveBeenCalled();
			const mockCalls = (mockCtx.json as Mock).mock.calls;
			const calledWith = mockCalls[0]?.[0];
			const options = mockCalls[0]?.[1];
			expect(calledWith).toHaveProperty("error");
			expect(calledWith.error).toContain("not found");
			expect(options).toEqual({ status: 404 });
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
			expect(calledWith.message).toContain("success");
		});

		it("存在しないジムIDでは404エラーを返すこと", async () => {
			const mockCtx = createMockContext({
				params: { gymId: "non-existent" },
			});

			// サービスがエラーをスローするようにモック
			mockService.deleteGym = vi
				.fn()
				.mockRejectedValue(new Error("Gym with ID non-existent not found"));

			await controller.deleteGym(mockCtx as unknown as AppContext);

			// 404エラーが返されたか検証
			expect(mockCtx.json).toHaveBeenCalled();
			const mockCalls = (mockCtx.json as Mock).mock.calls;
			const calledWith = mockCalls[0]?.[0];
			const options = mockCalls[0]?.[1];
			expect(calledWith).toHaveProperty("error");
			expect(calledWith.error).toContain("not found");
			expect(options).toEqual({ status: 404 });
		});
	});
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../client";
import {
	type CreateGymAccountRequest,
	type CreateGymAccountResponse,
	GymApiClient,
} from "../index";

// モックの型
interface MockResponse {
	message: string;
	gymId: string;
	ownerId: string;
}

// ApiClientのモック
vi.mock("../../client", () => {
	return {
		ApiClient: vi.fn().mockImplementation(() => {
			return {
				post: vi.fn(),
			};
		}),
	};
});

describe("GymApiClient", () => {
	let gymApiClient: GymApiClient;
	let mockApiClient: ApiClient;

	beforeEach(() => {
		// テスト前にモックをリセット
		vi.clearAllMocks();
		mockApiClient = new ApiClient();
		gymApiClient = new GymApiClient(mockApiClient);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe("createGymAccount", () => {
		it("正常なリクエストでジムアカウントを作成できる", async () => {
			// モックレスポンスを準備
			const mockResponse: MockResponse = {
				message: "ジムアカウントが正常に作成されました",
				gymId: "test-gym-id-123",
				ownerId: "test-owner-id-456",
			};

			// ApiClientのpostメソッドのモック
			mockApiClient.post = vi.fn().mockResolvedValue(mockResponse);

			// リクエストデータ
			const requestData: CreateGymAccountRequest = {
				name: "テストジム",
				phoneNumber: "03-1234-5678",
				ownerEmail: "owner@example.com",
				ownerName: "山田太郎",
				password: "Password123",
			};

			// 関数実行
			const result = await gymApiClient.createGymAccount(requestData);

			// 期待される結果の検証
			expect(mockApiClient.post).toHaveBeenCalledTimes(1);
			expect(mockApiClient.post).toHaveBeenCalledWith("/api/gyms/create", requestData);
			expect(result).toEqual(mockResponse);
			expect(result.gymId).toBe("test-gym-id-123");
			expect(result.ownerId).toBe("test-owner-id-456");
		});

		it("APIエラーが発生した場合、適切にエラーをスローする", async () => {
			// APIエラーをシミュレート
			const errorMessage = "メールアドレスが既に使用されています";
			mockApiClient.post = vi.fn().mockRejectedValue(new Error(errorMessage));

			// リクエストデータ
			const requestData: CreateGymAccountRequest = {
				name: "テストジム",
				phoneNumber: "03-1234-5678",
				ownerEmail: "existing@example.com",
				ownerName: "山田太郎",
				password: "Password123",
			};

			// エラーがスローされることを期待
			await expect(gymApiClient.createGymAccount(requestData)).rejects.toThrow(errorMessage);
			expect(mockApiClient.post).toHaveBeenCalledTimes(1);
			expect(mockApiClient.post).toHaveBeenCalledWith("/api/gyms/create", requestData);
		});
	});
});

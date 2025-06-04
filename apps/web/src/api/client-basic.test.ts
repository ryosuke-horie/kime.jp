import { vi } from "vitest";
/**
 * APIクライアントの基本テスト
 */
import { ApiClient } from "./client";

// モック設定
global.fetch = vi.fn();

describe("ApiClient 基本テスト", () => {
	let client: ApiClient;

	beforeEach(() => {
		vi.clearAllMocks();
		client = new ApiClient("development", undefined, false);
	});

	test("ApiClientのインスタンスが正常に作成される", () => {
		expect(client).toBeInstanceOf(ApiClient);
	});

	test("development環境での初期化", () => {
		const devClient = new ApiClient("development");
		expect(devClient).toBeInstanceOf(ApiClient);
	});

	test("production環境での初期化", () => {
		const prodClient = new ApiClient("production");
		expect(prodClient).toBeInstanceOf(ApiClient);
	});

	test("staging環境での初期化", () => {
		const stagingClient = new ApiClient("staging");
		expect(stagingClient).toBeInstanceOf(ApiClient);
	});

	test("APIキー付きでの初期化", () => {
		const apiKeyClient = new ApiClient("development", "test-api-key");
		expect(apiKeyClient).toBeInstanceOf(ApiClient);
	});

	test("getHealthメソッドが存在する", () => {
		expect(typeof client.getHealth).toBe("function");
	});

	test("getGymsメソッドが存在する", () => {
		expect(typeof client.getGyms).toBe("function");
	});

	test("getGymメソッドが存在する", () => {
		expect(typeof client.getGym).toBe("function");
	});

	test("createGymメソッドが存在する", () => {
		expect(typeof client.createGym).toBe("function");
	});

	test("updateGymメソッドが存在する", () => {
		expect(typeof client.updateGym).toBe("function");
	});

	test("deleteGymメソッドが存在する", () => {
		expect(typeof client.deleteGym).toBe("function");
	});
});

/**
 * API フック関数の簡単なテスト
 */
import { vi } from "vitest";

// モジュールをモック
vi.mock("@/api/client", () => ({
	ApiClient: vi.fn().mockImplementation(() => ({
		getHealth: vi.fn().mockResolvedValue({ status: "OK" }),
		getGyms: vi.fn().mockResolvedValue({ gyms: [], pagination: {} }),
		getGym: vi.fn().mockResolvedValue({ gym: {} }),
		createGym: vi.fn().mockResolvedValue({ gym: {} }),
		updateGym: vi.fn().mockResolvedValue({ success: true }),
		deleteGym: vi.fn().mockResolvedValue({ success: true }),
	})),
}));

vi.mock("@/api/with-error-handling", () => ({
	withErrorHandling: (fn: any) => fn,
}));

vi.mock("@tanstack/react-query", () => ({
	useQuery: vi.fn().mockReturnValue({
		data: null,
		isLoading: false,
		isError: false,
		isSuccess: true,
	}),
	useMutation: vi.fn().mockReturnValue({
		mutate: vi.fn(),
		isLoading: false,
		isError: false,
		isSuccess: true,
	}),
}));

describe("API フック (簡単なテスト)", () => {
	test("フックモジュールが正常にインポートできる", async () => {
		const hooks = await import("./use-api");
		
		expect(hooks.useHealthApi).toBeDefined();
		expect(hooks.useGymsApi).toBeDefined();
		expect(hooks.useGymApi).toBeDefined();
		expect(hooks.useCreateGymApi).toBeDefined();
		expect(hooks.useUpdateGymApi).toBeDefined();
		expect(hooks.useDeleteGymApi).toBeDefined();
	});

	test("フック関数が関数として定義されている", async () => {
		const hooks = await import("./use-api");
		
		expect(typeof hooks.useHealthApi).toBe("function");
		expect(typeof hooks.useGymsApi).toBe("function");
		expect(typeof hooks.useGymApi).toBe("function");
		expect(typeof hooks.useCreateGymApi).toBe("function");
		expect(typeof hooks.useUpdateGymApi).toBe("function");
		expect(typeof hooks.useDeleteGymApi).toBe("function");
	});
});
import { vi } from "vitest";
import type { Gym } from "../../db";
import type { IAdminRepository } from "../../repositories/admin-repository";
import type { IGymRepository } from "../../repositories/gym-repository";
import { gymFixtures } from "../fixtures/gym-fixtures";

/**
 * ジムリポジトリのモックを作成するヘルパー関数
 *
 * @returns モック化されたIGymRepositoryインターフェース
 */
export function createMockGymRepository(): IGymRepository {
	return {
		findAll: vi.fn().mockResolvedValue({
			items: gymFixtures.map((g) => ({
				gymId: g.id,
				name: g.name,
				ownerEmail: g.owner_email,
				createdAt: g.created_at.toString(),
				updatedAt: g.updated_at.toString(),
			})) as Gym[],
			meta: {
				total: gymFixtures.length,
				page: 1,
				limit: 10,
				totalPages: 1,
			},
		}),

		findById: vi.fn().mockImplementation(async (gymId: string) => {
			const gym = gymFixtures.find((g) => g.id === gymId);
			if (!gym) return undefined;

			return {
				gymId: gym.id,
				name: gym.name,
				ownerEmail: gym.owner_email,
				createdAt: gym.created_at.toString(),
				updatedAt: gym.updated_at.toString(),
			} as Gym;
		}),

		create: vi.fn().mockImplementation(async (gym) => {
			return {
				...gym,
				id: "new-gym-id",
				created_at: Date.now(),
				updated_at: Date.now(),
			};
		}),

		update: vi.fn().mockImplementation(async (gymId, data) => {
			const gym = gymFixtures.find((g) => g.id === gymId);
			if (!gym) return undefined;

			return {
				...gym,
				...data,
				updated_at: Date.now(),
			};
		}),

		delete: vi.fn().mockResolvedValue(true),
	};
}

/**
 * 管理者リポジトリのモックを作成するヘルパー関数
 * @returns モック化されたIAdminRepositoryインターフェース
 */
export function createMockAdminRepository(): IAdminRepository {
	return {
		findAdminByEmail: vi.fn().mockImplementation(async (email: string) => {
			// テスト用の既存アカウント
			if (email === "existing@example.com") {
				return {
					adminId: "admin-123",
					email: "existing@example.com",
					name: "既存管理者",
					role: "admin",
				};
			}
			return undefined;
		}),

		findOrCreateAdminAccount: vi.fn().mockImplementation(async (data) => {
			// 既存アカウントの場合
			if (data.email === "existing@example.com") {
				return "admin-123";
			}
			// 新規アカウントの場合は新しいIDを生成
			return `admin-${Date.now()}`;
		}),

		createGymRelationship: vi.fn().mockImplementation(async (data) => {
			return true;
		}),

		getGymRelationship: vi.fn().mockImplementation(async (adminId, gymId) => {
			// テスト用の既存関連付け
			if (adminId === "admin-123" && gymId === "gym-1") {
				return {
					adminId,
					gymId,
					role: "owner",
				};
			}
			return undefined;
		}),
	};
}

/**
 * Honoコンテキストのモックを作成するヘルパー関数
 *
 * @param options モックオプション
 * @returns モック化されたHonoコンテキスト
 */
export function createMockHonoContext(options?: {
	params?: Record<string, string>;
	query?: Record<string, string>;
	body?: Record<string, unknown>;
}) {
	const mockContext = {
		env: {
			DB: {} as D1Database,
		},
		req: {
			query: vi.fn().mockImplementation((key) => {
				return options?.query?.[key] || null;
			}),
			param: vi.fn().mockImplementation((key) => {
				return options?.params?.[key] || null;
			}),
			json: vi.fn().mockResolvedValue(options?.body || {}),
		},
		json: vi.fn().mockImplementation((data, status = 200) => {
			return {
				status,
				data,
			};
		}),
		status: vi.fn().mockReturnThis(),
		notFound: vi.fn().mockImplementation(() => {
			return {
				status: 404,
				data: { message: "Not Found" },
			};
		}),
		badRequest: vi.fn().mockImplementation((message) => {
			return {
				status: 400,
				data: { message },
			};
		}),
	};

	return mockContext;
}

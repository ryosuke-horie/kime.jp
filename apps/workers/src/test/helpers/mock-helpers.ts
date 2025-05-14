import { vi } from "vitest";
import { gymFixtures } from "../fixtures/gym-fixtures";
import { IGymRepository } from "../../repositories/gym-repository";
import type { Gym } from "../../db";

/**
 * ジムリポジトリのモックを作成するヘルパー関数
 * 
 * @returns モック化されたIGymRepositoryインターフェース
 */
export function createMockGymRepository(): IGymRepository {
	return {
		findAll: vi.fn().mockResolvedValue({
			items: gymFixtures.map(g => ({
				gymId: g.id,
				name: g.name,
				ownerEmail: g.owner_email,
				createdAt: g.created_at.toString(),
				updatedAt: g.updated_at.toString()
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
				updatedAt: gym.updated_at.toString()
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
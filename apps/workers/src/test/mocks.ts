import { vi } from "vitest";
import type { D1Database, D1PreparedStatement, Env } from "../env";
import { Database } from "../lib/database";

/**
 * Cloudflare環境のモックを作成する
 */
export const createCloudflareEnvMock = (customMocks = {}): Env => {
	// D1データベースのモック
	const mockD1 = {
		prepare: vi.fn().mockReturnValue({
			bind: vi.fn().mockImplementation(function (this: D1PreparedStatement) {
				return this;
			}),
			first: vi.fn().mockResolvedValue({ id: "test-id", name: "Test Item" }),
			run: vi.fn().mockResolvedValue({ results: [], success: true }),
			all: vi.fn().mockResolvedValue({
				results: [{ id: "item1" }, { id: "item2" }],
				success: true,
			}),
			raw: vi.fn().mockResolvedValue([{ id: "item1" }, { id: "item2" }]),
		}),
		dump: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
		batch: vi.fn().mockResolvedValue([{ results: [], success: true }]),
		exec: vi.fn().mockResolvedValue({ results: [], success: true }),
		withSession: vi.fn().mockImplementation(function (this: D1Database) {
			return this;
		}),
	};

	return {
		// D1データベース
		DB: mockD1,

		// 環境変数
		JWT_SECRET: "test-secret-key",
		NODE_ENV: "test",
		SKIP_AUTH: "true",
		...customMocks,
	};
};

/**
 * データベースクライアントのモック
 */
export const mockDatabaseClient = vi.fn().mockImplementation(() => ({
	getOne: vi.fn().mockResolvedValue({
		success: true,
		data: {
			gymId: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test Item",
			timezone: "Asia/Tokyo",
			ownerEmail: "test@example.com",
			plan: "basic",
			createdAt: "2023-01-01T00:00:00Z",
			updatedAt: "2023-01-01T00:00:00Z",
		},
	}),
	list: vi.fn().mockResolvedValue({
		success: true,
		data: [
			{
				gymId: "123e4567-e89b-12d3-a456-426614174000",
				name: "Test Gym 1",
				timezone: "Asia/Tokyo",
				ownerEmail: "test1@example.com",
				plan: "basic",
				createdAt: "2023-01-01T00:00:00Z",
				updatedAt: "2023-01-01T00:00:00Z",
			},
			{
				gymId: "123e4567-e89b-12d3-a456-426614174001",
				name: "Test Gym 2",
				timezone: "Asia/Tokyo",
				ownerEmail: "test2@example.com",
				plan: "premium",
				createdAt: "2023-01-02T00:00:00Z",
				updatedAt: "2023-01-02T00:00:00Z",
			},
		],
	}),
	create: vi.fn().mockResolvedValue({
		success: true,
		id: "new-gym-id",
	}),
	update: vi.fn().mockResolvedValue({
		success: true,
	}),
	delete: vi.fn().mockResolvedValue({
		success: true,
	}),
	transaction: vi.fn().mockResolvedValue({
		success: false,
		error: "Transaction not supported in D1",
	}),
	query: vi.fn().mockResolvedValue({
		success: true,
		data: [],
	}),
	queryOne: vi.fn().mockResolvedValue({
		success: false,
		error: "queryOne not supported in direct D1 client",
	}),
	queryMany: vi.fn().mockResolvedValue({
		success: false,
		error: "queryMany not supported in direct D1 client",
	}),
}));

/**
 * データベースのモック
 */
export const mockDatabase = vi.fn().mockImplementation(() => ({
	getOne: vi.fn().mockResolvedValue({
		success: true,
		data: {
			gymId: "test-id",
			name: "Test Item",
			timezone: "Asia/Tokyo",
			ownerEmail: "test@example.com",
			plan: "basic",
			createdAt: "2023-01-01T00:00:00Z",
			updatedAt: "2023-01-01T00:00:00Z",
		},
	}),
	list: vi.fn().mockResolvedValue({
		success: true,
		data: [
			{
				gymId: "item1",
				name: "Test Item 1",
				timezone: "Asia/Tokyo",
				ownerEmail: "test1@example.com",
				plan: "basic",
				createdAt: "2023-01-01T00:00:00Z",
				updatedAt: "2023-01-01T00:00:00Z",
			},
			{
				gymId: "item2",
				name: "Test Item 2",
				timezone: "Asia/Tokyo",
				ownerEmail: "test2@example.com",
				plan: "premium",
				createdAt: "2023-01-02T00:00:00Z",
				updatedAt: "2023-01-02T00:00:00Z",
			},
		],
	}),
	create: vi.fn().mockResolvedValue({
		success: true,
		id: "new-id",
	}),
	update: vi.fn().mockResolvedValue({
		success: true,
	}),
	delete: vi.fn().mockResolvedValue({
		success: true,
	}),
	bookClass: vi.fn().mockResolvedValue({
		success: true,
		bookingId: "booking-id",
	}),
	getClient: vi.fn().mockReturnValue({
		execute: vi.fn().mockResolvedValue([]),
	}),
}));

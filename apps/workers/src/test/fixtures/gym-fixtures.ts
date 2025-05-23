import { drizzle } from "drizzle-orm/d1";
import { gyms } from "../../db/schema";
import { createGymFixture, createMultipleFixtures } from "../helpers/fixture-generator";
import type { SchemaTypeMap } from "../helpers/schema-type-extractor";

/**
 * テスト用のジムデータフィクスチャ（型安全）
 */
export const gymFixtures: SchemaTypeMap["gyms"]["insert"][] = [
	createGymFixture({
		gymId: "gym-1",
		name: "フィットネスジムA",
		ownerEmail: "owner1@example.com",
	}),
	createGymFixture({
		gymId: "gym-2",
		name: "スポーツジムB",
		ownerEmail: "owner2@example.com",
	}),
	createGymFixture({
		gymId: "gym-3",
		name: "トレーニングセンターC",
		ownerEmail: "owner3@example.com",
	}),
];

/**
 * 指定した数のジムフィクスチャを生成する関数
 */
export function generateGymFixtures(count: number): SchemaTypeMap["gyms"]["insert"][] {
	return createMultipleFixtures("gyms", count);
}

/**
 * カスタムデータでジムフィクスチャを生成する関数
 */
export function createCustomGymFixtures(
	customData: Partial<SchemaTypeMap["gyms"]["insert"]>[],
): SchemaTypeMap["gyms"]["insert"][] {
	return createMultipleFixtures("gyms", customData.length, customData);
}

/**
 * テスト用データをDBに挿入する関数（Drizzle使用）
 */
export async function seedGymData(db: D1Database): Promise<void> {
	const drizzleDb = drizzle(db);

	try {
		await drizzleDb.insert(gyms).values(gymFixtures);
	} catch (error) {
		console.error("Failed to seed gym data:", error);
		throw error;
	}
}

/**
 * カスタムジムデータをDBに挿入する関数
 */
export async function seedCustomGymData(
	db: D1Database,
	customFixtures: SchemaTypeMap["gyms"]["insert"][],
): Promise<void> {
	const drizzleDb = drizzle(db);

	try {
		await drizzleDb.insert(gyms).values(customFixtures);
	} catch (error) {
		console.error("Failed to seed custom gym data:", error);
		throw error;
	}
}

/**
 * テスト用データをDBに挿入する関数（環境変数経由）
 */
export async function seedGymDataFromBindings(): Promise<void> {
	if (!globalThis.DB) {
		console.error("D1 database is not available in the test environment");
		return;
	}

	try {
		return await seedGymData(globalThis.DB);
	} catch (error) {
		console.error("Failed to seed gym data:", error);
		throw error;
	}
}

// 下位互換性のため、古い形式のフィクスチャも提供
export const legacyGymFixtures = gymFixtures.map((gym) => ({
	id: gym.gymId,
	name: gym.name,
	owner_email: gym.ownerEmail,
	created_at: new Date(gym.createdAt || "").getTime() || 1620000000,
	updated_at: new Date(gym.updatedAt || "").getTime() || 1620000000,
}));

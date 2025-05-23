import { drizzle } from "drizzle-orm/d1";
import { members } from "../../db/schema";
import { createMemberFixture, createMultipleFixtures } from "../helpers/fixture-generator";
import type { SchemaTypeMap } from "../helpers/schema-type-extractor";

/**
 * テスト用の会員データフィクスチャ（型安全）
 */
export const memberFixtures: SchemaTypeMap["members"]["insert"][] = [
	createMemberFixture({
		memberId: "member-1",
		gymId: "gym-1",
		name: "田中太郎",
		email: "tanaka@example.com",
		status: "active",
	}),
	createMemberFixture({
		memberId: "member-2",
		gymId: "gym-1",
		name: "佐藤花子",
		email: "sato@example.com",
		status: "active",
	}),
	createMemberFixture({
		memberId: "member-3",
		gymId: "gym-2",
		name: "鈴木次郎",
		email: "suzuki@example.com",
		status: "suspended",
	}),
];

/**
 * 指定したジムIDの会員フィクスチャを生成する関数
 */
export function generateMemberFixturesForGym(
	gymId: string,
	count: number,
): SchemaTypeMap["members"]["insert"][] {
	return createMultipleFixtures("members", count).map((member) => ({
		...member,
		gymId,
	}));
}

/**
 * カスタムデータで会員フィクスチャを生成する関数
 */
export function createCustomMemberFixtures(
	customData: Partial<SchemaTypeMap["members"]["insert"]>[],
): SchemaTypeMap["members"]["insert"][] {
	return createMultipleFixtures("members", customData.length, customData);
}

/**
 * テスト用の会員データをDBに挿入する関数
 */
export async function seedMemberData(db: D1Database): Promise<void> {
	const drizzleDb = drizzle(db);

	try {
		await drizzleDb.insert(members).values(memberFixtures);
	} catch (error) {
		console.error("Failed to seed member data:", error);
		throw error;
	}
}

/**
 * カスタム会員データをDBに挿入する関数
 */
export async function seedCustomMemberData(
	db: D1Database,
	customFixtures: SchemaTypeMap["members"]["insert"][],
): Promise<void> {
	const drizzleDb = drizzle(db);

	try {
		await drizzleDb.insert(members).values(customFixtures);
	} catch (error) {
		console.error("Failed to seed custom member data:", error);
		throw error;
	}
}

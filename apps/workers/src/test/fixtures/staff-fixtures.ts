import { drizzle } from "drizzle-orm/d1";
import { staff } from "../../db/schema";
import { hashPassword } from "../../utils/password";
import { createMultipleFixtures, createStaffFixture } from "../helpers/fixture-generator";
import type { SchemaTypeMap } from "../helpers/schema-type-extractor";

/**
 * テスト用定数：デフォルトパスワード
 */
export const TEST_PASSWORD = "password123";

/**
 * テスト用定数：ハッシュ化されたデフォルトパスワード（PBKDF2形式）
 */
export const TEST_PASSWORD_HASH =
	"vQ+08EWS3Aoo8A4Q0JVk1A==:Du0SUOrY+warqJA4nluv7pb6dzq6C3nOD9UFq+bIhMs=";

/**
 * テスト用のスタッフデータフィクスチャ（型安全）
 */
export const staffFixtures: SchemaTypeMap["staff"]["insert"][] = [
	createStaffFixture({
		staffId: "staff-1",
		gymId: "gym-1",
		name: "スタッフ太郎",
		email: "staff@test.com",
		role: "reception",
		passwordHash: TEST_PASSWORD_HASH, // "password123"のハッシュ
		active: 1,
	}),
	createStaffFixture({
		staffId: "owner-1",
		gymId: "gym-1",
		name: "オーナー花子",
		email: "owner@test.com",
		role: "admin",
		passwordHash: TEST_PASSWORD_HASH, // "password123"のハッシュ
		active: 1,
	}),
	createStaffFixture({
		staffId: "staff-2",
		gymId: "gym-1",
		name: "スタッフ次郎",
		email: "staff2@test.com",
		role: "reception",
		passwordHash: TEST_PASSWORD_HASH, // "password123"のハッシュ
		active: 1,
	}),
	createStaffFixture({
		staffId: "staff-inactive",
		gymId: "gym-1",
		name: "非アクティブスタッフ",
		email: "inactive@test.com",
		role: "reception",
		passwordHash: TEST_PASSWORD_HASH, // "password123"のハッシュ
		active: 0,
	}),
	createStaffFixture({
		staffId: "staff-gym2",
		gymId: "gym-2",
		name: "ジム2スタッフ",
		email: "staff-gym2@test.com",
		role: "reception",
		passwordHash: TEST_PASSWORD_HASH, // "password123"のハッシュ
		active: 1,
	}),
];

/**
 * 指定したジムIDのスタッフフィクスチャを生成する関数
 */
export function generateStaffFixturesForGym(
	gymId: string,
	count: number,
): SchemaTypeMap["staff"]["insert"][] {
	return createMultipleFixtures("staff", count).map((staff) => ({
		...staff,
		gymId,
	}));
}

/**
 * カスタムデータでスタッフフィクスチャを生成する関数
 */
export function createCustomStaffFixtures(
	customData: Partial<SchemaTypeMap["staff"]["insert"]>[],
): SchemaTypeMap["staff"]["insert"][] {
	return createMultipleFixtures("staff", customData.length, customData);
}

/**
 * テスト用のスタッフデータをDBに挿入する関数
 */
export async function seedStaffData(db: D1Database): Promise<void> {
	const drizzleDb = drizzle(db);

	try {
		await drizzleDb.insert(staff).values(staffFixtures);
	} catch (error) {
		console.error("Failed to seed staff data:", error);
		throw error;
	}
}

/**
 * カスタムスタッフデータをDBに挿入する関数
 */
export async function seedCustomStaffData(
	db: D1Database,
	customFixtures: SchemaTypeMap["staff"]["insert"][],
): Promise<void> {
	const drizzleDb = drizzle(db);

	try {
		await drizzleDb.insert(staff).values(customFixtures);
	} catch (error) {
		console.error("Failed to seed custom staff data:", error);
		throw error;
	}
}

/**
 * パスワードをハッシュ化したスタッフフィクスチャを生成
 */
export async function createStaffFixtureWithHashedPassword(
	overrides: Partial<SchemaTypeMap["staff"]["insert"]> & { password?: string },
): Promise<SchemaTypeMap["staff"]["insert"]> {
	const { password = "password123", ...rest } = overrides;
	const passwordHash = await hashPassword(password);

	return createStaffFixture({
		...rest,
		passwordHash,
	});
}

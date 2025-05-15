/// <reference path="../../../worker-configuration.d.ts" />
/// <reference path="../../types/cloudflare-test.d.ts" />
import { camelToSnakeCase } from "../helpers/fixture-generator";

/**
 * Gymテストフィクスチャの型定義
 * このインターフェースは自動生成されています - スキーマ変更後に更新されます
 */
export interface GymFixture {
	id: string;
	name: string;
	owner_email: string;
	created_at: number | string;
	updated_at: number | string;
}

/**
 * テスト用のジムデータフィクスチャ
 */
export const gymFixtures: GymFixture[] = [
	{
		id: "gym-1",
		name: "フィットネスジムA",
		owner_email: "owner1@example.com",
		created_at: 1620000000,
		updated_at: 1620000000,
	},
	{
		id: "gym-2",
		name: "スポーツジムB",
		owner_email: "owner2@example.com",
		created_at: 1620100000,
		updated_at: 1620100000,
	},
	{
		id: "gym-3",
		name: "トレーニングセンターC",
		owner_email: "owner3@example.com",
		created_at: 1620200000,
		updated_at: 1620200000,
	},
];

/**
 * テスト用データをDBに挿入する関数
 */
export async function seedGymData(db: D1Database): Promise<void> {
	// 一括でデータを挿入するSQLを構築
	const placeholders = gymFixtures.map(() => "(?, ?, ?, ?, ?)").join(", ");

	const values = gymFixtures.flatMap((gym) => [
		gym.id,
		gym.name,
		gym.owner_email,
		gym.created_at,
		gym.updated_at,
	]);

	// SQLを実行してテストデータを挿入
	await db
		.prepare(`
    INSERT INTO gyms (
      gym_id, name, owner_email, created_at, updated_at
    ) VALUES ${placeholders}
  `)
		.bind(...values)
		.run();
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

/**
 * フィクスチャのカラム名をDBのカラム名に変換するマッピング
 */
export const gymColumnMapping: Record<string, string> = {
	id: "gym_id",
	owner_email: "owner_email",
	created_at: "created_at",
	updated_at: "updated_at",
};

/**
 * フィクスチャデータをDBスキーマ用に変換する関数
 * @param fixture フィクスチャデータ
 * @returns DBスキーマに合わせたデータ
 */
export function convertGymFixtureToDb(fixture: GymFixture): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	// 固定のマッピング
	for (const [fixtureKey, dbKey] of Object.entries(gymColumnMapping)) {
		if (fixtureKey in fixture) {
			result[dbKey] = fixture[fixtureKey as keyof GymFixture];
		}
	}

	// マッピングにないものはスネークケースに自動変換
	for (const key of Object.keys(fixture) as Array<keyof GymFixture>) {
		if (!Object.keys(gymColumnMapping).includes(key as string)) {
			const dbKey = camelToSnakeCase(key as string);
			result[dbKey] = fixture[key];
		}
	}

	return result;
}

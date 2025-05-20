/**
 * テスト用のジムデータフィクスチャ
 */
export const gymFixtures = [
	{
		id: "gym-1",
		name: "フィットネスジムA",
		owner_email: "owner1@example.com",
		phone: "03-1234-5678",
		website: "https://example.com/gym-a",
		address: "東京都新宿区1-1-1",
		description: "24時間営業のフィットネスジム",
		created_at: 1620000000,
		updated_at: 1620000000,
	},
	{
		id: "gym-2",
		name: "スポーツジムB",
		owner_email: "owner2@example.com",
		phone: "03-2345-6789",
		website: "https://example.com/gym-b",
		address: "東京都渋谷区2-2-2",
		description: "各種スポーツ設備が充実したジム",
		created_at: 1620100000,
		updated_at: 1620100000,
	},
	{
		id: "gym-3",
		name: "トレーニングセンターC",
		owner_email: "owner3@example.com",
		phone: "03-3456-7890",
		website: "https://example.com/gym-c",
		address: "東京都港区3-3-3",
		description: "パーソナルトレーニングに特化したセンター",
		created_at: 1620200000,
		updated_at: 1620200000,
	},
];

/**
 * テスト用データをDBに挿入する関数
 */
export async function seedGymData(db: D1Database): Promise<void> {
	// 一括でデータを挿入するSQLを構築
	const placeholders = gymFixtures.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");

	const values = gymFixtures.flatMap((gym) => [
		gym.id,
		gym.name,
		gym.owner_email,
		gym.phone,
		gym.website,
		gym.address,
		gym.description,
		gym.created_at,
		gym.updated_at,
	]);

	// SQLを実行してテストデータを挿入
	await db
		.prepare(`
    INSERT INTO gyms (
      id, name, owner_email, phone, website, address, description, created_at, updated_at
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

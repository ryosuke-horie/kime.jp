/**
 * テスト用のジムデータフィクスチャ
 */
export const gymFixtures = [
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
	const placeholders = gymFixtures
		.map(() => "(?, ?, ?, ?, ?)")
		.join(", ");

	const values = gymFixtures.flatMap(
		(gym) => [
			gym.id,
			gym.name,
			gym.owner_email,
			gym.created_at,
			gym.updated_at,
		]
	);

	// SQLを実行してテストデータを挿入
	await db.prepare(`
    INSERT INTO gyms (
      id, name, owner_email, created_at, updated_at
    ) VALUES ${placeholders}
  `).bind(...values).run();
}
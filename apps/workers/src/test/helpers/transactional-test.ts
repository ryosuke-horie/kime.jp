/**
 * トランザクショナルなテストヘルパー
 * D1データベースのトランザクション機能を活用して、
 * テストデータの分離とクリーンアップを確実に行う
 */

/**
 * テストデータを設定する
 * @param db D1データベースインスタンス
 * @param table テーブル名
 * @param data 挿入するデータ
 */
export async function setupTestData(
	db: D1Database,
	table: string,
	data: Record<string, any>
): Promise<void> {
	const columns = Object.keys(data);
	const values = Object.values(data);
	const placeholders = columns.map(() => "?").join(", ");
	
	const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;
	
	await db.prepare(sql).bind(...values).run();
}

/**
 * テストデータをクリーンアップする
 * @param db D1データベースインスタンス
 * @param table テーブル名
 * @param where WHERE条件
 */
export async function cleanupTestData(
	db: D1Database,
	table: string,
	where: Record<string, any>
): Promise<void> {
	const conditions = Object.keys(where).map((key) => `${key} = ?`).join(" AND ");
	const values = Object.values(where);
	
	const sql = `DELETE FROM ${table} WHERE ${conditions}`;
	
	await db.prepare(sql).bind(...values).run();
}

/**
 * トランザクショナルなテストを実行する
 * テスト実行前の状態を記録し、実行後に復元する
 * @param db D1データベースインスタンス
 * @param testFn テスト関数
 */
export async function withTransactionalTest<T>(
	db: D1Database,
	testFn: (db: D1Database) => Promise<T>
): Promise<T> {
	// テスト実行前の状態を保存するための情報を収集
	const trackedData: Array<{
		table: string;
		primaryKey: string;
		ids: any[];
	}> = [];
	
	// 主要なテーブルの現在のIDを記録
	const tables = [
		{ name: "gyms", primaryKey: "gym_id" },
		{ name: "admin_accounts", primaryKey: "admin_id" },
		{ name: "admin_gym_relationships", primaryKey: "admin_id" }
	];
	
	// 各テーブルの現在のIDを記録
	for (const { name, primaryKey } of tables) {
		try {
			const result = await db
				.prepare(`SELECT ${primaryKey} FROM ${name}`)
				.all();
			
			const ids = result.results.map((row: any) => row[primaryKey]);
			trackedData.push({ table: name, primaryKey, ids });
		} catch (err) {
			// テーブルが存在しない場合は無視
		}
	}
	
	try {
		// テスト関数を実行
		const result = await testFn(db);
		return result;
	} finally {
		// テスト後のクリーンアップ
		// 新しく追加されたレコードを削除
		for (const { table, primaryKey, ids } of trackedData) {
			try {
				if (ids.length > 0) {
					// テスト前に存在していたIDを除外して削除
					const placeholders = ids.map(() => "?").join(", ");
					await db
						.prepare(`DELETE FROM ${table} WHERE ${primaryKey} NOT IN (${placeholders})`)
						.bind(...ids)
						.run();
				} else {
					// テスト前にレコードがなかった場合は全削除
					await db.exec(`DELETE FROM ${table}`);
				}
			} catch (err) {
				// エラーは無視（テーブルが存在しないなど）
			}
		}
	}
}

/**
 * トランザクショナルなテストを設定するヘルパー
 * beforeEach/afterEachで使用する
 */
export function setupTransactionalTest() {
	let trackedData: Array<{
		table: string;
		primaryKey: string;
		ids: any[];
	}> = [];
	
	return {
		/**
		 * テスト前の状態を記録
		 */
		async before(db: D1Database) {
			const tables = [
				{ name: "gyms", primaryKey: "gym_id" },
				{ name: "admin_accounts", primaryKey: "admin_id" },
				{ name: "admin_gym_relationships", primaryKey: "admin_id" }
			];
			
			trackedData = [];
			
			for (const { name, primaryKey } of tables) {
				try {
					const result = await db
						.prepare(`SELECT ${primaryKey} FROM ${name}`)
						.all();
					
					const ids = result.results.map((row: any) => row[primaryKey]);
					trackedData.push({ table: name, primaryKey, ids });
				} catch (err) {
					// テーブルが存在しない場合は無視
				}
			}
		},
		
		/**
		 * テスト後のクリーンアップ
		 */
		async after(db: D1Database) {
			for (const { table, primaryKey, ids } of trackedData) {
				try {
					if (ids.length > 0) {
						const placeholders = ids.map(() => "?").join(", ");
						await db
							.prepare(`DELETE FROM ${table} WHERE ${primaryKey} NOT IN (${placeholders})`)
							.bind(...ids)
							.run();
					} else {
						await db.exec(`DELETE FROM ${table}`);
					}
				} catch (err) {
					// エラーは無視
				}
			}
		}
	};
}
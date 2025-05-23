/**
 * Drizzleマイグレーションをテスト環境に適用するためのユーティリティ
 */
import { type Migration, migrations } from "./test-migrations";

/**
 * マイグレーションの一覧を取得
 * @returns ソートされたマイグレーションの配列
 */
export async function getMigrations(): Promise<Migration[]> {
	// マイグレーションはIDでソート済みであることを前提
	return migrations;
}

/**
 * マイグレーション履歴テーブルを作成
 * @param db D1データベースインスタンス
 */
async function createMigrationHistoryTable(db: D1Database): Promise<void> {
	await db.exec(
		"CREATE TABLE IF NOT EXISTS __drizzle_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, hash TEXT NOT NULL UNIQUE, created_at TEXT DEFAULT CURRENT_TIMESTAMP)",
	);
}

/**
 * マイグレーションが既に適用されているかチェック
 * @param db D1データベースインスタンス
 * @param hash マイグレーションのハッシュ値（ファイル名）
 * @returns 適用済みならtrue
 */
async function isMigrationApplied(db: D1Database, hash: string): Promise<boolean> {
	try {
		const result = await db
			.prepare("SELECT 1 FROM __drizzle_migrations WHERE hash = ?")
			.bind(hash)
			.first();
		return !!result;
	} catch {
		// テーブルが存在しない場合はfalse
		return false;
	}
}

/**
 * マイグレーションを記録
 * @param db D1データベースインスタンス
 * @param hash マイグレーションのハッシュ値（ファイル名）
 */
async function recordMigration(db: D1Database, hash: string): Promise<void> {
	await db
		.prepare("INSERT INTO __drizzle_migrations (hash) VALUES (?)")
		.bind(hash)
		.run();
}

/**
 * SQLステートメントを分割して実行
 * @param db D1データベースインスタンス
 * @param sql SQL文字列
 */
async function executeSQLStatements(db: D1Database, sql: string): Promise<void> {
	// Drizzleの区切り文字 "--> statement-breakpoint" で分割
	const statements = sql
		.split("--> statement-breakpoint")
		.map((stmt) => stmt.trim())
		.filter((stmt) => stmt.length > 0);

	for (const statement of statements) {
		// 空行やコメントをスキップ
		if (!statement || statement.startsWith("--")) {
			continue;
		}
		
		try {
			// D1では、各ステートメントを個別に実行
			// execは複数行のSQLに対して問題があるため、prepare/runを使用
			await db.prepare(statement).run();
		} catch (error) {
			console.error(`SQL実行エラー: ${statement.substring(0, 50)}...`);
			throw error;
		}
	}
}

/**
 * テストデータベースにマイグレーションを適用
 * @param db D1データベースインスタンス
 * @returns 適用結果
 */
export async function applyMigrationsToTestDB(db: D1Database): Promise<{
	success: boolean;
	appliedCount: number;
	skippedCount: number;
	errors: Error[];
}> {
	const errors: Error[] = [];
	let appliedCount = 0;
	let skippedCount = 0;

	try {
		// マイグレーション履歴テーブルを作成
		await createMigrationHistoryTable(db);

		// マイグレーションを取得
		const migrationList = await getMigrations();

		// 各マイグレーションを順番に適用
		for (const migration of migrationList) {
			try {
				// 既に適用済みかチェック
				if (await isMigrationApplied(db, migration.id)) {
					console.log(`⏭️  マイグレーション ${migration.id} はスキップされました（適用済み）`);
					skippedCount++;
					continue;
				}

				// SQL文を実行
				await executeSQLStatements(db, migration.sql);

				// マイグレーションを記録
				await recordMigration(db, migration.id);

				console.log(`✅ マイグレーション ${migration.id} が適用されました`);
				appliedCount++;
			} catch (error) {
				const err = error as Error;
				console.error(`❌ マイグレーション ${migration.id} の適用に失敗しました:`, err.message);
				errors.push(err);
			}
		}

		return {
			success: errors.length === 0,
			appliedCount,
			skippedCount,
			errors,
		};
	} catch (error) {
		const err = error as Error;
		console.error("マイグレーションの適用中にエラーが発生しました:", err.message);
		errors.push(err);
		return {
			success: false,
			appliedCount,
			skippedCount,
			errors,
		};
	}
}

/**
 * テストデータベースをリセット（全テーブル削除）
 * @param db D1データベースインスタンス
 */
export async function resetTestDatabase(db: D1Database): Promise<void> {
	try {
		// 全てのテーブルを取得（システムテーブルを除外）
		const tables = await db
			.prepare(`
				SELECT name FROM sqlite_master 
				WHERE type='table' 
				AND name NOT LIKE 'sqlite_%'
				AND name NOT LIKE '_cf_%'
				AND name NOT LIKE '__drizzle_%'
			`)
			.all();

		// 外部キー制約を一時的に無効化
		await db.exec("PRAGMA foreign_keys = OFF");

		// 依存関係の順序でテーブルを削除（外部キー制約がある子テーブルから削除）
		const orderedTables = [
			"admin_gym_relationships", // 他のテーブルを参照
			"admin_accounts",          // gymsを参照する可能性
			"gyms",                    // 基本テーブル
			"__drizzle_migrations"     // マイグレーション履歴
		];
		
		// 順序付きリストにあるテーブルを削除
		for (const tableName of orderedTables) {
			try {
				await db.exec(`DROP TABLE IF EXISTS ${tableName}`);
				console.log(`🗑️  テーブル ${tableName} を削除しました`);
			} catch (err) {
				// テーブルが存在しない場合は無視
			}
		}
		
		// その他のテーブルを削除
		for (const table of tables.results) {
			const tableName = (table as any).name;
			// システムテーブルでないことを再確認し、既に削除したテーブルをスキップ
			if (!tableName.startsWith("_cf_") && 
			    !tableName.startsWith("sqlite_") &&
			    !orderedTables.includes(tableName)) {
				try {
					await db.exec(`DROP TABLE IF EXISTS ${tableName}`);
					console.log(`🗑️  テーブル ${tableName} を削除しました`);
				} catch (err) {
					// エラーは無視（既に削除済みなど）
				}
			}
		}

		// 外部キー制約を再度有効化
		await db.exec("PRAGMA foreign_keys = ON");

		console.log("✅ テストデータベースがリセットされました");
	} catch (error) {
		console.error("テストデータベースのリセットに失敗しました:", error);
		throw error;
	}
}
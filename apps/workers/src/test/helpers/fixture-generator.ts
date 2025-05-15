/// <reference path="../../../worker-configuration.d.ts" />
import type { Column, Table } from "drizzle-orm";
// SQLiteColumnは直接インポートできないため、独自の型定義を用意
interface SQLiteColumn<T = unknown, U = string, V = string> {
	notNull?: boolean;
	hasDefault?: boolean;
}

/**
 * テーブルスキーマからフィクスチャの型を自動生成するユーティリティ
 * テーブル定義からTypeScriptの型を生成し、テストで使用するためのフィクスチャの型チェックを実現
 */
export type InferFixtureType<T extends Table> = {
	[K in keyof T["_"]["columns"]]?: T["_"]["columns"][K] extends Column<infer C, infer _A, infer _B>
		? C extends { data: infer U }
			? U
			: never
		: never;
};

/**
 * フィクスチャデータを受け取り、テーブルへの挿入を行うユーティリティ関数
 * @param db D1Database
 * @param tableName テーブル名
 * @param fixtures フィクスチャデータの配列
 * @param columnMap カラム名の変換マップ (TypeScriptのキャメルケースからSQLのスネークケースへの変換)
 */
export async function insertFixtures<T extends Record<string, unknown>>(
	db: D1Database,
	tableName: string,
	fixtures: T[],
	columnMap?: Record<string, string>,
): Promise<void> {
	if (fixtures.length === 0) return;

	// 最初のフィクスチャからカラム名を取得
	const firstFixture = fixtures[0];
	if (!firstFixture) return;
	const columns = Object.keys(firstFixture);

	// SQLのカラム名に変換（columnMapが提供されている場合はそれを使用）
	const sqlColumns = columns.map((col) => columnMap?.[col] || col);

	// プレースホルダーの作成
	const placeholders = fixtures.map(() => `(${columns.map(() => "?").join(", ")})`).join(", ");

	// バインド値の作成
	const values = fixtures.flatMap((fixture) => columns.map((col) => fixture[col]));

	// SQLを実行してフィクスチャを挿入
	await db
		.prepare(`
      INSERT INTO ${tableName} (
        ${sqlColumns.join(", ")}
      ) VALUES ${placeholders}
    `)
		.bind(...values)
		.run();
}

/**
 * テーブル定義とフィクスチャの整合性をチェックする関数
 * @param table Drizzleテーブル定義
 * @param fixture フィクスチャデータ
 * @returns 整合性チェックの結果（エラーメッセージのリスト）
 */
export function validateFixture<T extends Table>(
	table: T,
	fixture: Record<string, unknown>,
): string[] {
	const errors: string[] = [];

	// SQLiteTableの内部構造が変わったため、アクセス方法を変更
	// テーブル定義からカラムアクセサーを取得
	const columns = Object.entries(table).filter(
		([key]) =>
			typeof key === "string" &&
			key !== "$inferInsert" &&
			key !== "$inferSelect" &&
			!key.startsWith("_"),
	);

	// テーブル定義に存在しないカラムがフィクスチャに含まれていないかチェック
	for (const fixtureKey of Object.keys(fixture)) {
		// キャメルケースからスネークケースに変換してチェック
		const snakeCaseKey = camelToSnakeCase(fixtureKey);
		const exists = columns.some(
			([columnKey]) => columnKey === fixtureKey || columnKey === snakeCaseKey,
		);

		if (!exists) {
			errors.push(`フィクスチャのカラム "${fixtureKey}" はテーブル定義に存在しません`);
		}
	}

	// 必須カラムがフィクスチャに含まれているかチェック
	for (const [columnKey, column] of columns) {
		// column型の詳細な型定義
		const sqlColumn = column as unknown as { notNull?: boolean; hasDefault?: boolean };
		const isRequired = sqlColumn.notNull && !sqlColumn.hasDefault;

		if (isRequired) {
			const camelCaseKey = snakeToCamelCase(columnKey);
			const exists = Object.keys(fixture).some(
				(fixtureKey) => fixtureKey === columnKey || fixtureKey === camelCaseKey,
			);

			if (!exists) {
				errors.push(`必須カラム "${columnKey}" がフィクスチャに含まれていません`);
			}
		}
	}

	return errors;
}

/**
 * キャメルケースをスネークケースに変換
 */
export function camelToSnakeCase(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * スネークケースをキャメルケースに変換
 */
export function snakeToCamelCase(str: string): string {
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * DrizzleのDB接続からテーブル情報を取得するユーティリティ
 * @param d1 D1Database
 * @returns テーブル名の配列
 */
export async function getTableNames(d1: D1Database): Promise<string[]> {
	const result = await d1
		.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
		.all();

	return result.results?.map((row) => (row as { name: string }).name) || [];
}

/**
 * 特定のテーブルのカラム情報を取得するユーティリティ
 * @param d1 D1Database
 * @param tableName テーブル名
 * @returns カラム情報の配列
 */
export async function getTableColumns(
	d1: D1Database,
	tableName: string,
): Promise<Array<{ name: string; type: string; notnull: number; pk: number }>> {
	const result = await d1.prepare(`PRAGMA table_info(${tableName})`).all();

	return (result.results || []) as Array<{
		name: string;
		type: string;
		notnull: number;
		pk: number;
	}>;
}

/**
 * 現在のDBスキーマ状態に基づいてフィクスチャの整合性をチェック
 * @param d1 D1Database
 * @param tableName テーブル名
 * @param fixtures フィクスチャデータ配列
 * @returns 検証結果（エラーメッセージの配列）
 */
export async function validateFixturesAgainstDb(
	d1: D1Database,
	tableName: string,
	fixtures: Record<string, unknown>[],
): Promise<string[]> {
	const errors: string[] = [];

	// テーブルが存在するか確認
	const tables = await getTableNames(d1);
	if (!tables.includes(tableName)) {
		errors.push(`テーブル "${tableName}" が存在しません`);
		return errors;
	}

	// カラム情報の取得
	const columns = await getTableColumns(d1, tableName);

	// 各フィクスチャの検証
	for (const [index, fixture] of fixtures.entries()) {
		// フィクスチャに存在しないカラムのチェック
		for (const fixtureKey of Object.keys(fixture)) {
			// キャメルケースからスネークケースに変換してチェック
			const snakeCaseKey = camelToSnakeCase(fixtureKey);
			const exists = columns.some((col) => col.name === fixtureKey || col.name === snakeCaseKey);

			if (!exists) {
				errors.push(
					`フィクスチャ[${index}]のカラム "${fixtureKey}" はテーブル "${tableName}" に存在しません`,
				);
			}
		}

		// 必須カラムのチェック
		for (const column of columns) {
			if (column.notnull === 1 && column.pk === 0) {
				// Primary Key以外の必須カラム
				const camelCaseKey = snakeToCamelCase(column.name);
				const exists = Object.keys(fixture).some(
					(fixtureKey) => fixtureKey === column.name || fixtureKey === camelCaseKey,
				);

				if (!exists) {
					errors.push(`フィクスチャ[${index}]に必須カラム "${column.name}" が含まれていません`);
				}
			}
		}
	}

	return errors;
}

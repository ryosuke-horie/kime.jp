export interface MigrationChange {
	type:
		| "table_added"
		| "table_removed"
		| "field_added"
		| "field_removed"
		| "field_renamed"
		| "type_changed";
	tableName: string;
	fieldName?: string;
	oldFieldName?: string;
	newFieldName?: string;
	oldType?: string;
	newType?: string;
	defaultValue?: any;
	required?: boolean;
}

export interface FixtureTransformation {
	type: "field_added" | "field_removed" | "field_renamed" | "type_changed";
	tableName: string;
	fieldName?: string;
	oldFieldName?: string;
	newFieldName?: string;
	oldType?: string;
	newType?: string;
	defaultValue?: any;
	converter?: (value: any) => any;
}

export interface SchemaDefinition {
	[tableName: string]: {
		fields: string[];
		types?: Record<string, string>;
		required?: string[];
	};
}

export interface MigrationOptions {
	fieldRenames?: Record<string, string>;
	typeConverters?: Record<string, (value: any) => any>;
	defaultValues?: Record<string, any>;
}

export function detectMigrationChanges(
	oldSchema: SchemaDefinition,
	newSchema: SchemaDefinition,
	options: MigrationOptions = {},
): MigrationChange[] {
	const changes: MigrationChange[] = [];

	// テーブルの追加と削除を検出
	const oldTables = new Set(Object.keys(oldSchema));
	const newTables = new Set(Object.keys(newSchema));

	for (const tableName of newTables) {
		if (!oldTables.has(tableName)) {
			changes.push({
				type: "table_added",
				tableName,
			});
		}
	}

	for (const tableName of oldTables) {
		if (!newTables.has(tableName)) {
			changes.push({
				type: "table_removed",
				tableName,
			});
		}
	}

	// フィールドの変更を検出
	for (const tableName of newTables) {
		if (oldTables.has(tableName)) {
			const oldTable = oldSchema[tableName];
			const newTable = newSchema[tableName];
			if (!oldTable || !newTable) continue;

			const oldFields = new Set(oldTable.fields);
			const newFields = new Set(newTable.fields);

			// フィールドの追加
			for (const fieldName of newFields) {
				if (!oldFields.has(fieldName)) {
					const defaultKey = `${tableName}.${fieldName}`;
					changes.push({
						type: "field_added",
						tableName,
						fieldName,
						defaultValue: options.defaultValues?.[defaultKey] || null,
					});
				}
			}

			// フィールドの削除
			for (const fieldName of oldFields) {
				if (!newFields.has(fieldName)) {
					// リネーム情報をチェック
					const renameKey = `${tableName}.${fieldName}`;
					const newFieldName = options.fieldRenames?.[renameKey];

					if (newFieldName && newFields.has(newFieldName)) {
						changes.push({
							type: "field_renamed",
							tableName,
							oldFieldName: fieldName,
							newFieldName,
						});
					} else {
						changes.push({
							type: "field_removed",
							tableName,
							fieldName,
						});
					}
				}
			}

			// 型の変更を検出
			const oldTypes = oldTable.types || {};
			const newTypes = newTable.types || {};

			for (const fieldName of newFields) {
				if (oldFields.has(fieldName)) {
					const oldType = oldTypes[fieldName];
					const newType = newTypes[fieldName];

					if (oldType && newType && oldType !== newType) {
						const converterKey = `${tableName}.${fieldName}`;
						changes.push({
							type: "type_changed",
							tableName,
							fieldName,
							oldType,
							newType,
						});
					}
				}
			}
		}
	}

	return changes;
}

export function transformFixtureData(
	fixture: Record<string, any>,
	transformation: FixtureTransformation,
): Record<string, any> {
	const result = { ...fixture };

	switch (transformation.type) {
		case "field_added":
			if (transformation.fieldName) {
				result[transformation.fieldName] = transformation.defaultValue;
			}
			break;

		case "field_removed":
			if (transformation.fieldName) {
				delete result[transformation.fieldName];
			}
			break;

		case "field_renamed":
			if (transformation.oldFieldName && transformation.newFieldName) {
				const value = result[transformation.oldFieldName];
				result[transformation.newFieldName] = value;
				delete result[transformation.oldFieldName];
			}
			break;

		case "type_changed":
			if (transformation.fieldName && transformation.converter) {
				const currentValue = result[transformation.fieldName];
				if (currentValue !== null && currentValue !== undefined) {
					result[transformation.fieldName] = transformation.converter(currentValue);
				}
			}
			break;
	}

	return result;
}

export async function syncFixturesWithMigration(
	fixtures: Record<string, any[]>,
	changes: MigrationChange[],
): Promise<Record<string, any[]>> {
	const result = JSON.parse(JSON.stringify(fixtures)); // Deep clone

	for (const change of changes) {
		// テーブル追加の場合は空配列を作成
		if (change.type === "table_added") {
			result[change.tableName] = [];
			continue;
		}

		// テーブル削除の場合は削除
		if (change.type === "table_removed") {
			delete result[change.tableName];
			continue;
		}

		// フィールドレベルの変更を適用
		if (result[change.tableName]) {
			const transformation: FixtureTransformation = {
				type: change.type as any,
				tableName: change.tableName,
				fieldName: change.fieldName,
				oldFieldName: change.oldFieldName,
				newFieldName: change.newFieldName,
				oldType: change.oldType,
				newType: change.newType,
				defaultValue: change.defaultValue,
			};

			// 型変換のコンバーターを設定
			if (change.type === "type_changed" && change.oldType && change.newType) {
				transformation.converter = createTypeConverter(change.oldType, change.newType);
			}

			result[change.tableName] = result[change.tableName].map((fixture: any) =>
				transformFixtureData(fixture, transformation),
			);
		}
	}

	return result;
}

function createTypeConverter(oldType: string, newType: string): (value: any) => any {
	if (oldType === "string" && newType === "number") {
		return (value: string) => {
			const num = Number.parseInt(value, 10);
			return Number.isNaN(num) ? 0 : num;
		};
	}

	if (oldType === "number" && newType === "string") {
		return (value: number) => String(value);
	}

	if (oldType === "string" && newType === "boolean") {
		return (value: string) => value === "true" || value === "1";
	}

	if (oldType === "boolean" && newType === "string") {
		return (value: boolean) => String(value);
	}

	if (oldType === "boolean" && newType === "number") {
		return (value: boolean) => (value ? 1 : 0);
	}

	if (oldType === "number" && newType === "boolean") {
		return (value: number) => value !== 0;
	}

	// デフォルトは値をそのまま返す
	return (value: any) => value;
}

export async function backupFixtures(fixtures: Record<string, any[]>): Promise<string> {
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
	const backupPath = `backup-${timestamp}`;

	// 実際のプロジェクトでは、ファイルシステムやクラウドストレージに保存
	// ここではパスを返すだけ（テスト環境では実際の保存は行わない）
	return backupPath;
}

export async function restoreFixtures(backupPath: string): Promise<Record<string, any[]>> {
	try {
		const { readFile } = await import("node:fs/promises");
		const content = await readFile(backupPath, "utf-8");
		return JSON.parse(content);
	} catch (error) {
		console.warn(`Failed to restore fixtures from ${backupPath}:`, error);
		return {};
	}
}

export function generateMigrationScript(
	changes: MigrationChange[],
	targetFormat: "sql" | "drizzle" = "sql",
): string {
	const lines: string[] = [];

	if (targetFormat === "sql") {
		lines.push("-- Migration Script");
		lines.push(`-- Generated at: ${new Date().toISOString()}`);
		lines.push("");

		for (const change of changes) {
			switch (change.type) {
				case "table_added":
					lines.push(`-- TODO: Add CREATE TABLE statement for ${change.tableName}`);
					break;
				case "table_removed":
					lines.push(`DROP TABLE IF EXISTS ${change.tableName};`);
					break;
				case "field_added":
					lines.push(`ALTER TABLE ${change.tableName} ADD COLUMN ${change.fieldName} TEXT;`);
					break;
				case "field_removed":
					lines.push(`ALTER TABLE ${change.tableName} DROP COLUMN ${change.fieldName};`);
					break;
				case "field_renamed":
					lines.push(
						`ALTER TABLE ${change.tableName} RENAME COLUMN ${change.oldFieldName} TO ${change.newFieldName};`,
					);
					break;
			}
		}
	} else {
		lines.push("// Drizzle Migration Script");
		lines.push(`// Generated at: ${new Date().toISOString()}`);
		lines.push("");
		lines.push("import { sql } from 'drizzle-orm';");
		lines.push("");
		lines.push("export async function up(db: any) {");

		for (const change of changes) {
			switch (change.type) {
				case "field_added":
					lines.push(
						`  await db.execute(sql\`ALTER TABLE ${change.tableName} ADD COLUMN ${change.fieldName} TEXT\`);`,
					);
					break;
				case "field_removed":
					lines.push(
						`  await db.execute(sql\`ALTER TABLE ${change.tableName} DROP COLUMN ${change.fieldName}\`);`,
					);
					break;
			}
		}

		lines.push("}");
	}

	return lines.join("\n");
}

export function validateMigrationChanges(changes: MigrationChange[]): string[] {
	const warnings: string[] = [];

	// 破壊的変更のチェック
	const destructiveChanges = changes.filter(
		(c) => c.type === "table_removed" || c.type === "field_removed",
	);

	if (destructiveChanges.length > 0) {
		warnings.push("破壊的変更が検出されました。データの損失に注意してください。");
	}

	// 必須フィールドの追加チェック
	const requiredFieldAdditions = changes.filter(
		(c) => c.type === "field_added" && c.required === true && !c.defaultValue,
	);

	if (requiredFieldAdditions.length > 0) {
		warnings.push("デフォルト値のない必須フィールドの追加が検出されました。");
	}

	return warnings;
}

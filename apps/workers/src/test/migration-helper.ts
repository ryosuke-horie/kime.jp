import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
/// <reference path="../../worker-configuration.d.ts" />
/// <reference path="../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";
import { camelToSnakeCase, getTableColumns, getTableNames } from "./helpers/fixture-generator";

/**
 * マイグレーション実行後にテストフィクスチャを更新するヘルパー
 * マイグレーション実行時に呼び出すことで、スキーマ変更とテストデータの同期を自動化
 */
export async function updateFixturesAfterMigration(): Promise<void> {
	console.log("テストフィクスチャの更新を開始します...");

	if (typeof env === "undefined" || !env.DB) {
		console.error("D1データベースが利用できません。テストフィクスチャの更新をスキップします。");
		return;
	}

	try {
		// 利用可能なテーブル一覧を取得
		const tables = await getTableNames(env.DB);
		console.log(`利用可能なテーブル: ${tables.join(", ")}`);

		// 対象のフィクスチャファイルを特定
		const fixturesDir = join(__dirname, "fixtures");

		// テーブルごとのフィクスチャを更新
		for (const table of tables) {
			const fixtureFilename = `${table.replace(/s$/, "")}-fixtures.ts`;
			const fixtureFilePath = join(fixturesDir, fixtureFilename);

			// フィクスチャファイルが存在する場合のみ処理
			if (existsSync(fixtureFilePath)) {
				await updateFixtureFile(fixtureFilePath, table);
			} else {
				console.log(`フィクスチャファイル ${fixtureFilename} は存在しないためスキップします`);
			}
		}

		console.log("テストフィクスチャの更新が完了しました");
	} catch (error) {
		console.error("テストフィクスチャの更新に失敗しました:", error);
	}
}

/**
 * 特定のフィクスチャファイルを更新
 * @param filePath フィクスチャファイルのパス
 * @param tableName テーブル名
 */
async function updateFixtureFile(filePath: string, tableName: string): Promise<void> {
	console.log(`${filePath} を更新しています...`);

	try {
		// フィクスチャファイルの内容を読み込み
		const content = readFileSync(filePath, "utf-8");

		// フィクスチャファイルの構造を分析（簡易的な方法）
		const fixtures = extractFixturesFromContent(content);
		if (!fixtures || fixtures.length === 0) {
			console.log(`${filePath} にフィクスチャが見つかりませんでした`);
			return;
		}

		// テーブルの最新のカラム情報を取得
		if (!env.DB) return;
		const columns = await getTableColumns(env.DB, tableName);

		// 型定義を生成
		const typeDefinition = generateTypeDefinition(tableName, columns);

		// 必要な型インポートを追加（既存のインポートを保持）
		const updatedContent = addTypeDefinition(content, typeDefinition);

		// ファイルを更新
		writeFileSync(filePath, updatedContent, "utf-8");
		console.log(`${filePath} の更新が完了しました`);
	} catch (error) {
		console.error(`${filePath} の更新に失敗しました:`, error);
	}
}

/**
 * コンテンツからフィクスチャを抽出（簡易版）
 */
function extractFixturesFromContent(content: string): Record<string, unknown>[] | null {
	// 正規表現でフィクスチャ配列を抽出（厳密ではない）
	const fixtureMatch = content.match(/export\s+const\s+\w+Fixtures\s*=\s*(\[\s\S]*?\]);/);
	if (!fixtureMatch) return null;

	// 文字列からJSONを抽出する危険なアプローチなので、実際はより安全な方法を検討
	try {
		// 警告: 実際のプロダクションコードではevalを使用すべきではありません
		// これはテストデータ用の簡易的な実装です
		const fixtureContent = fixtureMatch[1] || "[]";
		// biome-ignore lint/security/noGlobalEval: テスト用の簡易実装のためevalを許容
		return eval(fixtureContent) as Record<string, unknown>[];
	} catch (error) {
		console.error("フィクスチャの抽出に失敗しました:", error);
		return null;
	}
}

/**
 * 型定義を生成
 */
function generateTypeDefinition(
	tableName: string,
	columns: { name: string; type: string; notnull: number; pk: number }[],
): string {
	// テーブル名から単数形の型名を生成
	const typeName = tableName
		.replace(/s$/, "")
		.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
	const capitalizedTypeName = typeName.charAt(0).toUpperCase() + typeName.slice(1);

	// カラム定義を生成
	const columnDefs = columns
		.map((column) => {
			const propName = column.name.includes("_")
				? column.name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
				: column.name;

			const isRequired = column.notnull === 1;
			let typeDef = "";

			switch (column.type.toLowerCase()) {
				case "integer":
					typeDef = "number";
					break;
				case "text":
					typeDef = "string";
					break;
				case "real":
					typeDef = "number";
					break;
				case "blob":
					typeDef = "Uint8Array";
					break;
				default:
					typeDef = "unknown";
			}

			return `  ${propName}${isRequired ? "" : "?"}${isRequired ? "!" : ""}: ${typeDef};`;
		})
		.join("\n");

	return `
/**
 * ${capitalizedTypeName}テストフィクスチャの型定義
 * このインターフェースは自動生成されています - スキーマ変更後に更新されます
 */
export interface ${capitalizedTypeName}Fixture {
${columnDefs}
}
`;
}

/**
 * 型定義をコンテンツに追加
 */
function addTypeDefinition(content: string, typeDefinition: string): string {
	// 既存のインターフェース定義を検索
	const interfaceMatch = content.match(/export\s+interface\s+\w+Fixture\s*\{[\s\S]*?\}/);

	if (interfaceMatch) {
		// 既存の型定義を更新
		return content.replace(interfaceMatch[0], typeDefinition.trim());
	}

	// 新しい型定義を挿入（ファイルの先頭付近、importの後）
	const importEndIndex = content.lastIndexOf("import");
	if (importEndIndex >= 0) {
		const endOfImports = content.indexOf("\n", content.indexOf(";", importEndIndex)) + 1;
		return content.slice(0, endOfImports) + typeDefinition + content.slice(endOfImports);
	}

	// importがない場合はファイルの先頭に追加
	return typeDefinition + content;
}

/**
 * CLI用のエントリーポイント
 */
if (typeof require !== "undefined" && require.main === module) {
	updateFixturesAfterMigration()
		.then(() => process.exit(0))
		.catch((error) => {
			console.error("エラーが発生しました:", error);
			process.exit(1);
		});
}

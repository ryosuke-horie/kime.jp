#!/usr/bin/env tsx

import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	convertSqlToD1Compatible,
	extractSqlStatements,
	generateTestMigrationFile,
} from "../src/test/helpers/migration-converter";

// ESMでのdirname相当を取得
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
	try {
		// マイグレーションディレクトリのパス
		const migrationsDir = join(__dirname, "../migrations");
		const outputPath = join(__dirname, "../src/test/test-migrations.ts");

		// 全てのSQLファイルを取得
		const files = await readdir(migrationsDir);
		const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort();

		console.log(`Found ${sqlFiles.length} migration files`);

		// 各SQLファイルを読み込んで変換
		const allStatements: string[] = [];

		for (const sqlFile of sqlFiles) {
			console.log(`Processing: ${sqlFile}`);
			const sqlPath = join(migrationsDir, sqlFile);
			const sqlContent = await readFile(sqlPath, "utf-8");

			// D1互換形式に変換
			const d1CompatibleSql = convertSqlToD1Compatible(sqlContent);

			// SQL文を抽出
			const statements = extractSqlStatements(d1CompatibleSql);

			// ファイル名をコメントとして追加
			allStatements.push(`-- Migration: ${sqlFile}`);
			allStatements.push(...statements);
		}

		// TypeScript形式で出力
		const tsContent = generateTestMigrationFile(allStatements);

		// ヘッダーコメントを追加
		const finalContent = `/**
 * 自動生成されたテスト用マイグレーション定義
 * 生成日時: ${new Date().toISOString()}
 * 
 * このファイルは自動生成されます。直接編集しないでください。
 * 本番用マイグレーションファイルから生成するには以下を実行:
 * pnpm sync-migrations
 */

${tsContent}
`;

		// ファイルに書き込み
		await writeFile(outputPath, finalContent, "utf-8");

		console.log(`✅ Successfully generated: ${outputPath}`);
		console.log(`   Total statements: ${allStatements.filter((s) => !s.startsWith("--")).length}`);
	} catch (error) {
		console.error("❌ Error:", error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

main();

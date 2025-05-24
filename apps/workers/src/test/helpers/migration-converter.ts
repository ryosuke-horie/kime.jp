/**
 * マイグレーションコンバーター
 * Drizzleのマイグレーションファイル（.sql）をCloudflare D1互換形式に変換し、
 * TypeScript形式でエクスポートする
 */

/**
 * SQLをCloudflare D1互換の形式に変換する
 */
export function convertSqlToD1Compatible(sql: string): string {
	let result = sql;

	// バッククォートをダブルクォートに変換（CHECK制約内のシングルクォート文字列は除外）
	// まず、CHECK制約内の文字列を一時的に置換
	const checkConstraints: string[] = [];
	result = result.replace(/CHECK\s*\([^)]+\)/gi, (match) => {
		checkConstraints.push(match);
		return `__CHECK_PLACEHOLDER_${checkConstraints.length - 1}__`;
	});

	// バッククォートをダブルクォートに変換
	result = result.replace(/`/g, '"');

	// CHECK制約を元に戻す
	checkConstraints.forEach((constraint, index) => {
		result = result.replace(`__CHECK_PLACEHOLDER_${index}__`, constraint);
	});

	// DEFAULT 'CURRENT_TIMESTAMP' を DEFAULT CURRENT_TIMESTAMP に変換
	result = result.replace(/DEFAULT\s+'CURRENT_TIMESTAMP'/gi, "DEFAULT CURRENT_TIMESTAMP");

	// statement-breakpoint コメントを除去
	result = result.replace(/--> statement-breakpoint/g, "");

	// 余分な空行を除去
	result = result.replace(/\n\s*\n\s*\n/g, "\n\n");

	return result.trim();
}

/**
 * SQL文字列から個別のSQL文を抽出する
 */
export function extractSqlStatements(sql: string): string[] {
	// セミコロンで分割
	const rawStatements = sql.split(";");

	const statements: string[] = [];

	for (const stmt of rawStatements) {
		// 各文を行ごとに分割して処理
		const lines = stmt
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0 && !line.startsWith("--"));

		// 有効な行がある場合のみ文として追加
		if (lines.length > 0) {
			const cleanedStatement = lines.join("\n").trim();
			if (cleanedStatement.length > 0) {
				statements.push(`${cleanedStatement};`);
			}
		}
	}

	return statements;
}

/**
 * SQL文の配列からTypeScript形式のマイグレーションファイルを生成する
 */
export function generateTestMigrationFile(statements: string[]): string {
	const lines: string[] = [];

	lines.push("export const migrations = [");

	for (const statement of statements) {
		// コメント行とPRAGMA文は通常の文字列として出力
		if (statement.startsWith("--") || statement.startsWith("PRAGMA ")) {
			lines.push(`\t"${statement}",`);
		} else {
			lines.push(`\t\`${statement}\`,`);
		}
	}

	lines.push("];");

	return lines.join("\n");
}

/**
 * SQL内容を変換するメイン関数
 */
export function convertMigrationContent(sqlContent: string): string {
	// D1互換形式に変換
	const d1CompatibleSql = convertSqlToD1Compatible(sqlContent);

	// SQL文を抽出
	const statements = extractSqlStatements(d1CompatibleSql);

	// TypeScript形式で出力
	return generateTestMigrationFile(statements);
}

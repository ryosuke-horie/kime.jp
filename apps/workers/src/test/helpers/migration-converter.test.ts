import { describe, expect, it } from "vitest";
import {
	convertSqlToD1Compatible,
	extractSqlStatements,
	generateTestMigrationFile,
} from "./migration-converter";

describe("マイグレーションコンバーター", () => {
	describe("convertSqlToD1Compatible", () => {
		it("バッククォートをダブルクォートに変換すること", () => {
			const sql = "CREATE TABLE `users` (`id` text PRIMARY KEY)";
			const result = convertSqlToD1Compatible(sql);
			expect(result).toBe('CREATE TABLE "users" ("id" text PRIMARY KEY)');
		});

		it("DEFAULT 'CURRENT_TIMESTAMP'をDEFAULT CURRENT_TIMESTAMPに変換すること", () => {
			const sql = "created_at text DEFAULT 'CURRENT_TIMESTAMP'";
			const result = convertSqlToD1Compatible(sql);
			expect(result).toBe("created_at text DEFAULT CURRENT_TIMESTAMP");
		});

		it("CHECK制約の中のIN句内のバッククォートを処理すること", () => {
			const sql = "role TEXT NOT NULL CHECK(role IN ('admin', 'staff')) DEFAULT 'staff'";
			const result = convertSqlToD1Compatible(sql);
			expect(result).toBe("role TEXT NOT NULL CHECK(role IN ('admin', 'staff')) DEFAULT 'staff'");
		});

		it("statement-breakpointコメントを除去すること", () => {
			const sql = `CREATE TABLE users (id text);
--> statement-breakpoint
CREATE INDEX idx ON users (id);`;
			const result = convertSqlToD1Compatible(sql);
			expect(result).not.toContain("statement-breakpoint");
			expect(result).toContain("CREATE TABLE");
			expect(result).toContain("CREATE INDEX");
		});
	});

	describe("extractSqlStatements", () => {
		it("複数のSQL文を個別に抽出すること", () => {
			const sql = `CREATE TABLE users (id text);
CREATE INDEX idx ON users (id);
CREATE TABLE posts (id text);`;

			const statements = extractSqlStatements(sql);

			expect(statements).toHaveLength(3);
			expect(statements[0]).toContain("CREATE TABLE users");
			expect(statements[1]).toContain("CREATE INDEX");
			expect(statements[2]).toContain("CREATE TABLE posts");
		});

		it("空行やコメントを除外すること", () => {
			const sql = `
CREATE TABLE users (id text);

-- This is a comment
CREATE INDEX idx ON users (id);

`;

			const statements = extractSqlStatements(sql);

			expect(statements).toHaveLength(2);
			expect(statements[0]).toContain("CREATE TABLE users");
			expect(statements[1]).toContain("CREATE INDEX");
		});
	});

	describe("generateTestMigrationFile", () => {
		it("TypeScript形式のマイグレーションファイルを生成すること", () => {
			const statements = [
				'CREATE TABLE "users" ("id" text PRIMARY KEY, "name" text NOT NULL)',
				'CREATE INDEX "users_name_idx" ON "users" ("name")',
			];

			const result = generateTestMigrationFile(statements);

			expect(result).toContain("export const migrations = [");
			expect(result).toContain("`CREATE TABLE");
			expect(result).toContain("`CREATE INDEX");
			expect(result).toContain("];");
		});

		it("適切なインデントとフォーマットを適用すること", () => {
			const statements = ['CREATE TABLE "users" ("id" text)'];

			const result = generateTestMigrationFile(statements);

			expect(result).toMatch(/export const migrations = \[\n\s+`CREATE TABLE/);
			expect(result).toMatch(/`,\n\];/);
		});

		it("複数行のSQL文を適切に処理すること", () => {
			const statements = [
				`CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP
)`,
			];

			const result = generateTestMigrationFile(statements);

			expect(result).toContain("CREATE TABLE");
			expect(result).toContain("id");
			expect(result).toContain("name");
			expect(result).toContain("created_at");
		});
	});
});

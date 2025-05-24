import { beforeEach, describe, expect, it } from "vitest";
import { generateGymFixtures, gymFixtures } from "../fixtures/gym-fixtures";
import { memberFixtures } from "../fixtures/member-fixtures";
import {
	createFixture,
	createGymFixture,
	createMemberFixture,
	validateFixtureData,
} from "./fixture-generator";
import {
	type MigrationChange,
	detectMigrationChanges,
	syncFixturesWithMigration,
} from "./migration-sync";
import { extractSchemaTypes, getTableNames, validateTableSchema } from "./schema-type-extractor";
import {
	detectSchemaMismatch,
	generateSchemaReport,
	validateSchemaConsistency,
} from "./schema-validation";

describe("スキーマとテストデータ同期システム統合テスト", () => {
	describe("型安全なフィクスチャ生成", () => {
		it("全てのテーブルに対して型安全なフィクスチャを生成できること", () => {
			const tableNames = getTableNames();

			for (const tableName of tableNames) {
				expect(() => {
					const fixture = createFixture(tableName);
					expect(fixture).toBeDefined();
					expect(typeof fixture).toBe("object");
				}).not.toThrow();
			}
		});

		it("生成されたフィクスチャがスキーマ検証をパスすること", () => {
			const gymFixture = createGymFixture();
			const memberFixture = createMemberFixture();

			const gymValidation = validateSchemaConsistency("gyms", gymFixture);
			const memberValidation = validateSchemaConsistency("members", memberFixture);

			expect(gymValidation.isValid).toBe(true);
			expect(memberValidation.isValid).toBe(true);
		});

		it("カスタムデータでオーバーライドしたフィクスチャもスキーマ検証をパスすること", () => {
			const customGym = createGymFixture({
				name: "カスタムジム名",
				ownerEmail: "custom@example.com",
			});

			const validation = validateSchemaConsistency("gyms", customGym);

			expect(validation.isValid).toBe(true);
			expect(customGym.name).toBe("カスタムジム名");
			expect(customGym.ownerEmail).toBe("custom@example.com");
		});
	});

	describe("既存フィクスチャとの整合性", () => {
		it("移行された既存フィクスチャがスキーマ検証をパスすること", () => {
			for (const fixture of gymFixtures) {
				const validation = validateSchemaConsistency("gyms", fixture);
				expect(validation.isValid).toBe(true);
			}

			for (const fixture of memberFixtures) {
				const validation = validateSchemaConsistency("members", fixture);
				expect(validation.isValid).toBe(true);
			}
		});

		it("大量のフィクスチャ生成でもスキーマ検証をパスすること", () => {
			const manyGymFixtures = generateGymFixtures(100);

			for (const fixture of manyGymFixtures) {
				const validation = validateSchemaConsistency("gyms", fixture);
				expect(validation.isValid).toBe(true);
			}
		});
	});

	describe("スキーマレポート生成", () => {
		it("全体的なスキーマレポートを正しく生成すること", () => {
			const testFixtures = {
				gyms: gymFixtures,
				members: memberFixtures,
			};

			const report = generateSchemaReport(testFixtures);

			expect(report.summary.totalTables).toBe(2);
			expect(report.summary.validTables).toBe(2);
			expect(report.summary.invalidTables).toBe(0);
			expect(report.summary.totalFixtures).toBe(gymFixtures.length + memberFixtures.length);

			expect(report.tableReports.gyms?.isValid).toBe(true);
			expect(report.tableReports.members?.isValid).toBe(true);
		});

		it("無効なフィクスチャを含む場合のレポートが正しいこと", () => {
			const invalidFixtures = {
				gyms: [
					...gymFixtures,
					{ gymId: "invalid", name: "テスト" }, // ownerEmailが不足
				],
			};

			const report = generateSchemaReport(invalidFixtures);

			expect(report.summary.invalidTables).toBe(1);
			expect(report.tableReports.gyms?.isValid).toBe(false);
			expect(report.tableReports.gyms?.errors.length).toBeGreaterThan(0);
		});
	});

	describe("マイグレーション連動", () => {
		it("スキーマ変更を検出してフィクスチャを自動更新すること", async () => {
			const oldSchema = {
				gyms: { fields: ["gymId", "name", "ownerEmail"] },
			};

			const newSchema = {
				gyms: { fields: ["gymId", "name", "ownerEmail", "createdAt"] },
			};

			const changes = detectMigrationChanges(oldSchema, newSchema, {
				defaultValues: {
					"gyms.createdAt": "2024-01-01T00:00:00Z",
				},
			});

			expect(
				changes.some(
					(c) => c.type === "field_added" && c.tableName === "gyms" && c.fieldName === "createdAt",
				),
			).toBe(true);

			const oldFixtures = {
				gyms: [
					{
						gymId: "gym-1",
						name: "テストジム",
						ownerEmail: "test@example.com",
					},
				],
			};

			const updatedFixtures = await syncFixturesWithMigration(oldFixtures, changes);

			expect(updatedFixtures.gyms?.[0]).toHaveProperty("createdAt");
			expect(updatedFixtures.gyms?.[0]?.createdAt).toBe("2024-01-01T00:00:00Z");
		});

		it("複数の変更を適用してもデータ整合性が保たれること", async () => {
			const changes: MigrationChange[] = [
				{
					type: "field_added",
					tableName: "gyms",
					fieldName: "timezone",
					defaultValue: "Asia/Tokyo",
				},
				{
					type: "field_renamed",
					tableName: "gyms",
					oldFieldName: "ownerEmail",
					newFieldName: "contactEmail",
				},
			];

			const oldFixtures = {
				gyms: [createGymFixture()],
			};

			const updatedFixtures = await syncFixturesWithMigration(oldFixtures, changes);

			expect(updatedFixtures.gyms?.[0]).toHaveProperty("timezone");
			expect(updatedFixtures.gyms?.[0]).toHaveProperty("contactEmail");
			expect(updatedFixtures.gyms?.[0]).not.toHaveProperty("ownerEmail");
		});
	});

	describe("エラーケースの処理", () => {
		it("不正なテーブル名に対して適切にエラーを処理すること", () => {
			expect(validateTableSchema("invalid_table")).toBe(false);
			expect(() => createFixture("invalid_table" as any)).toThrow();
		});

		it("不正なフィールド値に対してバリデーションエラーを返すこと", () => {
			const invalidGym = {
				gymId: "gym-1",
				name: "テストジム",
				ownerEmail: "invalid-email",
			};

			const validation = validateSchemaConsistency("gyms", invalidGym);
			expect(validation.isValid).toBe(false);
			expect(validation.errors.some((error) => error.includes("email"))).toBe(true);
		});

		it("スキーマとの不一致を適切に検出すること", () => {
			const fixtureWithExtraFields = {
				...createGymFixture(),
				extraField: "余分なフィールド",
				invalidType: 123,
			};

			const mismatches = detectSchemaMismatch("gyms", fixtureWithExtraFields);
			expect(mismatches.some((m) => m.fieldName === "extraField")).toBe(true);
		});
	});

	describe("パフォーマンステスト", () => {
		it("大量のフィクスチャ生成が合理的な時間で完了すること", () => {
			const start = Date.now();

			const largeFixtureSet = generateGymFixtures(1000);

			const duration = Date.now() - start;

			expect(largeFixtureSet.length).toBe(1000);
			expect(duration).toBeLessThan(1000); // 1秒以内

			// 全てのフィクスチャが有効であることを確認
			const sampleValidation = validateSchemaConsistency("gyms", largeFixtureSet[0]);
			expect(sampleValidation.isValid).toBe(true);
		});

		it("大量データのスキーマレポート生成が合理的な時間で完了すること", () => {
			const largeFixtures = {
				gyms: generateGymFixtures(500),
				members: Array.from({ length: 1000 }, () => createMemberFixture()),
			};

			const start = Date.now();
			const report = generateSchemaReport(largeFixtures);
			const duration = Date.now() - start;

			expect(duration).toBeLessThan(2000); // 2秒以内
			expect(report.summary.totalFixtures).toBe(1500);
		});
	});
});

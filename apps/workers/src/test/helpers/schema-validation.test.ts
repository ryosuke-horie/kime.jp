import { describe, expect, it } from "vitest";
import { createGymFixture, createMemberFixture } from "./fixture-generator";
import {
	type FieldMismatch,
	type SchemaValidationResult,
	checkFieldCompatibility,
	detectSchemaMismatch,
	generateSchemaReport,
	validateSchemaConsistency,
} from "./schema-validation";

describe("スキーマ検証ユーティリティ", () => {
	describe("validateSchemaConsistency", () => {
		it("有効なフィクスチャデータに対してtrueを返すこと", () => {
			const gymFixture = createGymFixture();
			const memberFixture = createMemberFixture();

			const result = validateSchemaConsistency("gyms", gymFixture);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);

			const memberResult = validateSchemaConsistency("members", memberFixture);
			expect(memberResult.isValid).toBe(true);
			expect(memberResult.errors).toHaveLength(0);
		});

		it("必須フィールドが不足している場合にエラーを返すこと", () => {
			const invalidGym = {
				gymId: "gym-1",
				// name, ownerEmailが不足
			};

			const result = validateSchemaConsistency("gyms", invalidGym);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors.some((error) => error.includes("name"))).toBe(true);
			expect(result.errors.some((error) => error.includes("ownerEmail"))).toBe(true);
		});

		it("型が一致しない場合にエラーを返すこと", () => {
			const invalidGym = {
				gymId: "gym-1",
				name: "テストジム",
				ownerEmail: "invalid-email", // 無効なメール形式
				passwordHash: 123, // 文字列でなく数値
			};

			const result = validateSchemaConsistency("gyms", invalidGym);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it("enumの制約に違反している場合にエラーを返すこと", () => {
			const invalidMember = createMemberFixture({
				status: "invalid_status" as any,
			});

			const result = validateSchemaConsistency("members", invalidMember);
			expect(result.isValid).toBe(false);
			expect(result.errors.some((error) => error.includes("status"))).toBe(true);
		});
	});

	describe("checkFieldCompatibility", () => {
		it("互換性のあるフィールドに対してtrueを返すこと", () => {
			expect(checkFieldCompatibility("gymId", "string", "gym-1")).toBe(true);
			expect(checkFieldCompatibility("name", "string", "テストジム")).toBe(true);
			expect(checkFieldCompatibility("capacity", "number", 20)).toBe(true);
			expect(checkFieldCompatibility("active", "number", 1)).toBe(true);
		});

		it("互換性のないフィールドに対してfalseを返すこと", () => {
			expect(checkFieldCompatibility("gymId", "string", 123)).toBe(false);
			expect(checkFieldCompatibility("name", "string", null)).toBe(false);
			expect(checkFieldCompatibility("capacity", "number", "20")).toBe(false);
			expect(checkFieldCompatibility("active", "number", true)).toBe(false);
		});

		it("nullableなフィールドでnullを許可すること", () => {
			expect(checkFieldCompatibility("passwordHash", "string", null, true)).toBe(true);
			expect(checkFieldCompatibility("email", "string", null, true)).toBe(true);
		});

		it("nullableでないフィールドでnullを拒否すること", () => {
			expect(checkFieldCompatibility("name", "string", null, false)).toBe(false);
			expect(checkFieldCompatibility("gymId", "string", null, false)).toBe(false);
		});
	});

	describe("detectSchemaMismatch", () => {
		it("スキーマに存在しないフィールドを検出すること", () => {
			const fixtureWithExtraFields = {
				...createGymFixture(),
				extraField: "存在しないフィールド",
				anotherExtra: 123,
			};

			const mismatches = detectSchemaMismatch("gyms", fixtureWithExtraFields);
			expect(mismatches.length).toBeGreaterThan(0);
			expect(mismatches.some((m) => m.fieldName === "extraField")).toBe(true);
			expect(mismatches.some((m) => m.fieldName === "anotherExtra")).toBe(true);
		});

		it("型の不一致を検出すること", () => {
			const fixtureWithTypeMismatch = {
				gymId: "gym-1",
				name: 123, // 文字列であるべきなのに数値
				ownerEmail: "test@example.com",
			};

			const mismatches = detectSchemaMismatch("gyms", fixtureWithTypeMismatch);
			expect(mismatches.some((m) => m.fieldName === "name" && m.reason === "type_mismatch")).toBe(
				true,
			);
		});

		it("必須フィールドの不足を検出すること", () => {
			const incompleteFixture = {
				gymId: "gym-1",
				// name, ownerEmailが不足
			};

			const mismatches = detectSchemaMismatch("gyms", incompleteFixture);
			expect(
				mismatches.some((m) => m.fieldName === "name" && m.reason === "missing_required"),
			).toBe(true);
			expect(
				mismatches.some((m) => m.fieldName === "ownerEmail" && m.reason === "missing_required"),
			).toBe(true);
		});
	});

	describe("generateSchemaReport", () => {
		it("全体的なスキーマレポートを生成すること", () => {
			const testFixtures = {
				gyms: [createGymFixture(), createGymFixture()],
				members: [createMemberFixture(), createMemberFixture()],
				classes: [],
			};

			const report = generateSchemaReport(testFixtures);

			expect(report).toHaveProperty("summary");
			expect(report).toHaveProperty("tableReports");
			expect(report.summary).toHaveProperty("totalTables");
			expect(report.summary).toHaveProperty("validTables");
			expect(report.summary).toHaveProperty("invalidTables");

			expect(report.tableReports).toHaveProperty("gyms");
			expect(report.tableReports).toHaveProperty("members");
			expect(report.tableReports.gyms).toHaveProperty("isValid");
			expect(report.tableReports.gyms).toHaveProperty("fixtureCount");
		});

		it("無効なフィクスチャを含む場合に適切にレポートすること", () => {
			const testFixtures = {
				gyms: [
					createGymFixture(),
					{ gymId: "invalid" }, // 必須フィールド不足
				],
				members: [createMemberFixture()],
			};

			const report = generateSchemaReport(testFixtures);

			expect(report.summary.invalidTables).toBeGreaterThan(0);
			expect(report.tableReports.gyms.isValid).toBe(false);
			expect(report.tableReports.gyms.errors.length).toBeGreaterThan(0);
		});

		it("空のフィクスチャセットに対して適切にレポートすること", () => {
			const report = generateSchemaReport({});

			expect(report.summary.totalTables).toBe(0);
			expect(report.summary.validTables).toBe(0);
			expect(report.summary.invalidTables).toBe(0);
		});
	});
});

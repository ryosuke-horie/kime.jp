import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { classes, type gyms, type members } from "../../db/schema";
import {
	type SchemaTypeMap,
	extractSchemaTypes,
	getTableNames,
	validateTableSchema,
} from "./schema-type-extractor";

describe("スキーマ型抽出ユーティリティ", () => {
	describe("extractSchemaTypes", () => {
		it("スキーマからInsert型とSelect型を抽出できること", () => {
			const schemaTypes = extractSchemaTypes();

			expect(schemaTypes).toHaveProperty("gyms");
			expect(schemaTypes).toHaveProperty("members");
			expect(schemaTypes).toHaveProperty("classes");

			expect(schemaTypes.gyms).toHaveProperty("insert");
			expect(schemaTypes.gyms).toHaveProperty("select");
			expect(schemaTypes.members).toHaveProperty("insert");
			expect(schemaTypes.members).toHaveProperty("select");
		});

		it("抽出された型がDrizzleの型と一致すること", () => {
			const schemaTypes = extractSchemaTypes();

			type ExpectedGymInsert = InferInsertModel<typeof gyms>;
			type ExpectedGymSelect = InferSelectModel<typeof gyms>;
			type ExpectedMemberInsert = InferInsertModel<typeof members>;
			type ExpectedMemberSelect = InferSelectModel<typeof members>;

			const _gymInsertTest: ExpectedGymInsert = {} as SchemaTypeMap["gyms"]["insert"];
			const _gymSelectTest: ExpectedGymSelect = {} as SchemaTypeMap["gyms"]["select"];
			const _memberInsertTest: ExpectedMemberInsert = {} as SchemaTypeMap["members"]["insert"];
			const _memberSelectTest: ExpectedMemberSelect = {} as SchemaTypeMap["members"]["select"];

			expect(true).toBe(true);
		});
	});

	describe("getTableNames", () => {
		it("全てのテーブル名を取得できること", () => {
			const tableNames = getTableNames();

			expect(tableNames).toContain("gyms");
			expect(tableNames).toContain("members");
			expect(tableNames).toContain("classes");
			expect(tableNames).toContain("bookings");
			expect(tableNames).toContain("checkins");
			expect(tableNames).toContain("staff");
			expect(tableNames).toContain("adminAccounts");

			expect(tableNames.length).toBeGreaterThan(10);
		});

		it("取得されるテーブル名が重複していないこと", () => {
			const tableNames = getTableNames();
			const uniqueNames = [...new Set(tableNames)];

			expect(tableNames.length).toBe(uniqueNames.length);
		});
	});

	describe("validateTableSchema", () => {
		it("有効なテーブル名の場合trueを返すこと", () => {
			expect(validateTableSchema("gyms")).toBe(true);
			expect(validateTableSchema("members")).toBe(true);
			expect(validateTableSchema("classes")).toBe(true);
		});

		it("無効なテーブル名の場合falseを返すこと", () => {
			expect(validateTableSchema("invalid_table")).toBe(false);
			expect(validateTableSchema("")).toBe(false);
			expect(validateTableSchema("non_existent")).toBe(false);
		});
	});
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	type FixtureTransformation,
	type MigrationChange,
	backupFixtures,
	detectMigrationChanges,
	restoreFixtures,
	syncFixturesWithMigration,
	transformFixtureData,
} from "./migration-sync";

describe("マイグレーション同期ユーティリティ", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("detectMigrationChanges", () => {
		it("新しいテーブルの追加を検出すること", () => {
			const oldSchema = {
				gyms: { fields: ["gymId", "name", "ownerEmail"] },
			};

			const newSchema = {
				gyms: { fields: ["gymId", "name", "ownerEmail"] },
				members: { fields: ["memberId", "gymId", "name"] },
			};

			const changes = detectMigrationChanges(oldSchema, newSchema);

			expect(changes.some((c) => c.type === "table_added" && c.tableName === "members")).toBe(true);
		});

		it("テーブルの削除を検出すること", () => {
			const oldSchema = {
				gyms: { fields: ["gymId", "name", "ownerEmail"] },
				oldTable: { fields: ["id", "data"] },
			};

			const newSchema = {
				gyms: { fields: ["gymId", "name", "ownerEmail"] },
			};

			const changes = detectMigrationChanges(oldSchema, newSchema);

			expect(changes.some((c) => c.type === "table_removed" && c.tableName === "oldTable")).toBe(
				true,
			);
		});

		it("フィールドの追加を検出すること", () => {
			const oldSchema = {
				gyms: { fields: ["gymId", "name", "ownerEmail"] },
			};

			const newSchema = {
				gyms: { fields: ["gymId", "name", "ownerEmail", "newField"] },
			};

			const changes = detectMigrationChanges(oldSchema, newSchema);

			expect(
				changes.some(
					(c) => c.type === "field_added" && c.tableName === "gyms" && c.fieldName === "newField",
				),
			).toBe(true);
		});

		it("フィールドの削除を検出すること", () => {
			const oldSchema = {
				gyms: { fields: ["gymId", "name", "ownerEmail", "oldField"] },
			};

			const newSchema = {
				gyms: { fields: ["gymId", "name", "ownerEmail"] },
			};

			const changes = detectMigrationChanges(oldSchema, newSchema);

			expect(
				changes.some(
					(c) => c.type === "field_removed" && c.tableName === "gyms" && c.fieldName === "oldField",
				),
			).toBe(true);
		});

		it("フィールド名の変更を検出すること", () => {
			const oldSchema = {
				gyms: { fields: ["gymId", "old_name", "ownerEmail"] },
			};

			const newSchema = {
				gyms: { fields: ["gymId", "new_name", "ownerEmail"] },
			};

			const changes = detectMigrationChanges(oldSchema, newSchema, {
				fieldRenames: {
					"gyms.old_name": "new_name",
				},
			});

			expect(
				changes.some(
					(c) =>
						c.type === "field_renamed" &&
						c.tableName === "gyms" &&
						c.oldFieldName === "old_name" &&
						c.newFieldName === "new_name",
				),
			).toBe(true);
		});
	});

	describe("transformFixtureData", () => {
		it("フィールド追加の変換を実行すること", () => {
			const fixture = {
				gymId: "gym-1",
				name: "テストジム",
				ownerEmail: "test@example.com",
			};

			const transformation: FixtureTransformation = {
				type: "field_added",
				tableName: "gyms",
				fieldName: "newField",
				defaultValue: "デフォルト値",
			};

			const result = transformFixtureData(fixture, transformation);

			expect(result).toHaveProperty("newField");
			expect(result.newField).toBe("デフォルト値");
			expect(result.gymId).toBe("gym-1");
		});

		it("フィールド削除の変換を実行すること", () => {
			const fixture = {
				gymId: "gym-1",
				name: "テストジム",
				ownerEmail: "test@example.com",
				obsoleteField: "削除予定",
			};

			const transformation: FixtureTransformation = {
				type: "field_removed",
				tableName: "gyms",
				fieldName: "obsoleteField",
			};

			const result = transformFixtureData(fixture, transformation);

			expect(result).not.toHaveProperty("obsoleteField");
			expect(result.gymId).toBe("gym-1");
		});

		it("フィールド名変更の変換を実行すること", () => {
			const fixture = {
				gymId: "gym-1",
				old_name: "古い名前",
				ownerEmail: "test@example.com",
			};

			const transformation: FixtureTransformation = {
				type: "field_renamed",
				tableName: "gyms",
				oldFieldName: "old_name",
				newFieldName: "new_name",
			};

			const result = transformFixtureData(fixture, transformation);

			expect(result).not.toHaveProperty("old_name");
			expect(result).toHaveProperty("new_name");
			expect(result.new_name).toBe("古い名前");
			expect(result.gymId).toBe("gym-1");
		});

		it("型変換の変換を実行すること", () => {
			const fixture = {
				gymId: "gym-1",
				capacity: "20", // 文字列から数値に変換
			};

			const transformation: FixtureTransformation = {
				type: "type_changed",
				tableName: "gyms",
				fieldName: "capacity",
				oldType: "string",
				newType: "number",
				converter: (value: string) => Number.parseInt(value, 10),
			};

			const result = transformFixtureData(fixture, transformation);

			expect(typeof result.capacity).toBe("number");
			expect(result.capacity).toBe(20);
		});
	});

	describe("syncFixturesWithMigration", () => {
		it("マイグレーションに基づいてフィクスチャを更新すること", async () => {
			const oldFixtures = {
				gyms: [
					{
						gymId: "gym-1",
						name: "テストジム",
						ownerEmail: "test@example.com",
					},
				],
			};

			const changes: MigrationChange[] = [
				{
					type: "field_added",
					tableName: "gyms",
					fieldName: "createdAt",
					defaultValue: "2024-01-01T00:00:00Z",
				},
			];

			const result = await syncFixturesWithMigration(oldFixtures, changes);

			expect(result.gyms).toBeDefined();
			expect(result.gyms![0]).toHaveProperty("createdAt");
			expect(result.gyms![0].createdAt).toBe("2024-01-01T00:00:00Z");
		});

		it("複数の変更を適用すること", async () => {
			const oldFixtures = {
				gyms: [
					{
						gymId: "gym-1",
						old_name: "テストジム",
						ownerEmail: "test@example.com",
						obsoleteField: "削除予定",
					},
				],
			};

			const changes: MigrationChange[] = [
				{
					type: "field_renamed",
					tableName: "gyms",
					oldFieldName: "old_name",
					newFieldName: "name",
				},
				{
					type: "field_removed",
					tableName: "gyms",
					fieldName: "obsoleteField",
				},
				{
					type: "field_added",
					tableName: "gyms",
					fieldName: "createdAt",
					defaultValue: "2024-01-01T00:00:00Z",
				},
			];

			const result = await syncFixturesWithMigration(oldFixtures, changes);

			expect(result.gyms).toBeDefined();
			expect(result.gyms![0]).toHaveProperty("name");
			expect(result.gyms![0]).not.toHaveProperty("old_name");
			expect(result.gyms![0]).not.toHaveProperty("obsoleteField");
			expect(result.gyms![0]).toHaveProperty("createdAt");
		});
	});

	describe("backupFixtures", () => {
		it("フィクスチャのバックアップを作成すること", async () => {
			const fixtures = {
				gyms: [{ gymId: "gym-1", name: "テストジム" }],
				members: [{ memberId: "member-1", name: "テストユーザー" }],
			};

			const backupPath = await backupFixtures(fixtures);

			expect(typeof backupPath).toBe("string");
			expect(backupPath).toMatch(/backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/);
		});
	});

	describe("restoreFixtures", () => {
		it("バックアップからフィクスチャを復元すること", async () => {
			const originalFixtures = {
				gyms: [{ gymId: "gym-1", name: "テストジム" }],
			};

			const backupPath = "backup-2024-01-01T12-00-00";

			// モック関数をセットアップ
			const mockReadBackup = vi.fn().mockResolvedValue(originalFixtures);
			vi.doMock("fs/promises", () => ({
				readFile: mockReadBackup,
			}));

			const restoredFixtures = await restoreFixtures(backupPath);

			expect(restoredFixtures).toEqual(originalFixtures);
		});
	});
});

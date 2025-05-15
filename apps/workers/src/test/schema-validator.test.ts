/// <reference path="../../worker-configuration.d.ts" />
/// <reference path="../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { gyms } from "../db/schema";
import { gymFixtures } from "./fixtures/gym-fixtures";
import { validateFixture, validateFixturesAgainstDb } from "./helpers/fixture-generator";
import { isD1Available, itWithD1 } from "./helpers/skippable-test";
import { createGymFixture } from "./helpers/test-factory";

/**
 * スキーマとフィクスチャの整合性チェックテスト
 */
describe("Schema-Fixture Validation Tests", () => {
	describe("固定フィクスチャの検証", () => {
		it("gymFixturesがスキーマ定義と一致していること", () => {
			// 既存のgymFixturesを1つずつ検証
			gymFixtures.forEach((fixture, index) => {
				// フィクスチャからスキーマに合わせた形式に変換
				const formattedFixture = {
					gymId: fixture.id,
					name: fixture.name,
					ownerEmail: fixture.owner_email,
					createdAt: fixture.created_at.toString(),
					updatedAt: fixture.updated_at.toString(),
				};

				const errors = validateFixture(gyms, formattedFixture);
				expect(errors, `Fixture[${index}] should be valid: ${errors.join(", ")}`).toHaveLength(0);
			});
		});

		it("ファクトリー関数で生成したフィクスチャがスキーマ定義と一致していること", () => {
			const gymFixture = createGymFixture();
			const errors = validateFixture(gyms, gymFixture);
			expect(
				errors,
				`Factory-generated fixture should be valid: ${errors.join(", ")}`,
			).toHaveLength(0);
		});
	});

	describe("D1データベーススキーマの検証", () => {
		itWithD1("gymFixturesがD1データベースのテーブル定義と一致していること", async () => {
			if (!isD1Available() || !env.DB) return;

			// gymFixturesをDBのカラム名形式に変換
			const dbFormatFixtures = gymFixtures.map((fixture) => ({
				gym_id: fixture.id,
				name: fixture.name,
				owner_email: fixture.owner_email,
				created_at: fixture.created_at.toString(),
				updated_at: fixture.updated_at.toString(),
			}));

			const errors = await validateFixturesAgainstDb(env.DB, "gyms", dbFormatFixtures);
			expect(errors, `Fixtures should match DB schema: ${errors.join(", ")}`).toHaveLength(0);
		});

		itWithD1(
			"ファクトリー関数で生成したフィクスチャがD1データベースと一致していること",
			async () => {
				if (!isD1Available() || !env.DB) return;

				const gymFixture = createGymFixture();

				// キャメルケースのプロパティをスネークケースに変換
				const dbFormatFixture = {
					gym_id: gymFixture.gymId,
					name: gymFixture.name,
					owner_email: gymFixture.ownerEmail,
					created_at: gymFixture.createdAt,
					updated_at: gymFixture.updatedAt,
				};

				const errors = await validateFixturesAgainstDb(env.DB, "gyms", [dbFormatFixture]);
				expect(
					errors,
					`Factory-generated fixture should match DB schema: ${errors.join(", ")}`,
				).toHaveLength(0);
			},
		);
	});
});

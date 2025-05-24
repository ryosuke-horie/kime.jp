import { describe, expect, it } from "vitest";
import {
	type FixtureOptions,
	createBookingFixture,
	createClassFixture,
	createFixture,
	createGymFixture,
	createMemberFixture,
	createMultipleFixtures,
	createStaffFixture,
	validateFixtureData,
} from "./fixture-generator";
import type { SchemaTypeMap } from "./schema-type-extractor";

describe("フィクスチャ生成ユーティリティ", () => {
	describe("createFixture", () => {
		it("gymsテーブルの有効なフィクスチャを生成できること", () => {
			const fixture = createFixture("gyms");

			expect(fixture).toHaveProperty("gymId");
			expect(fixture).toHaveProperty("name");
			expect(fixture).toHaveProperty("ownerEmail");
			expect(typeof fixture.gymId).toBe("string");
			expect(typeof fixture.name).toBe("string");
			expect(typeof fixture.ownerEmail).toBe("string");
			expect(fixture.ownerEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
		});

		it("membersテーブルの有効なフィクスチャを生成できること", () => {
			const fixture = createFixture("members");

			expect(fixture).toHaveProperty("memberId");
			expect(fixture).toHaveProperty("gymId");
			expect(fixture).toHaveProperty("name");
			expect(fixture).toHaveProperty("status");
			expect(typeof fixture.memberId).toBe("string");
			expect(typeof fixture.gymId).toBe("string");
			expect(typeof fixture.name).toBe("string");
			expect(["active", "suspended", "withdrawn"]).toContain(fixture.status);
		});

		it("カスタムデータで上書きできること", () => {
			const customData = {
				name: "カスタムジム名",
				ownerEmail: "custom@example.com",
			};
			const fixture = createFixture("gyms", customData);

			expect(fixture.name).toBe("カスタムジム名");
			expect(fixture.ownerEmail).toBe("custom@example.com");
			expect(fixture).toHaveProperty("gymId");
		});
	});

	describe("createMultipleFixtures", () => {
		it("指定した数だけフィクスチャを生成できること", () => {
			const fixtures = createMultipleFixtures("gyms", 3);

			expect(fixtures).toHaveLength(3);
			expect(fixtures[0]).toHaveProperty("gymId");
			expect(fixtures[1]).toHaveProperty("gymId");
			expect(fixtures[2]).toHaveProperty("gymId");

			const gymIds = fixtures.map((f) => f.gymId);
			const uniqueGymIds = [...new Set(gymIds)];
			expect(uniqueGymIds).toHaveLength(3);
		});

		it("カスタムデータ配列で個別に上書きできること", () => {
			const customDataArray = [{ name: "ジム1" }, { name: "ジム2" }, { name: "ジム3" }];
			const fixtures = createMultipleFixtures("gyms", 3, customDataArray);

			expect(fixtures[0]?.name).toBe("ジム1");
			expect(fixtures[1]?.name).toBe("ジム2");
			expect(fixtures[2]?.name).toBe("ジム3");
		});
	});

	describe("テーブル固有のフィクスチャ生成関数", () => {
		it("createGymFixtureが有効なジムデータを生成すること", () => {
			const gym = createGymFixture();

			expect(gym).toHaveProperty("gymId");
			expect(gym).toHaveProperty("name");
			expect(gym).toHaveProperty("ownerEmail");
			expect(gym.gymId).toMatch(/^gym-/);
			expect(gym.name).toBeTruthy();
			expect(gym.ownerEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
		});

		it("createMemberFixtureが有効な会員データを生成すること", () => {
			const member = createMemberFixture();

			expect(member).toHaveProperty("memberId");
			expect(member).toHaveProperty("gymId");
			expect(member).toHaveProperty("name");
			expect(member).toHaveProperty("status");
			expect(member.memberId).toMatch(/^member-/);
			expect(member.gymId).toMatch(/^gym-/);
			expect(["active", "suspended", "withdrawn"]).toContain(member.status);
		});

		it("createClassFixtureが有効なクラスデータを生成すること", () => {
			const classData = createClassFixture();

			expect(classData).toHaveProperty("classId");
			expect(classData).toHaveProperty("gymId");
			expect(classData).toHaveProperty("title");
			expect(classData).toHaveProperty("startsAt");
			expect(classData).toHaveProperty("endsAt");
			expect(classData).toHaveProperty("capacity");
			expect(classData.classId).toMatch(/^class-/);
			expect(typeof classData.capacity).toBe("number");
			expect(classData.capacity).toBeGreaterThan(0);
		});

		it("createBookingFixtureが有効な予約データを生成すること", () => {
			const booking = createBookingFixture();

			expect(booking).toHaveProperty("bookingId");
			expect(booking).toHaveProperty("gymId");
			expect(booking).toHaveProperty("classId");
			expect(booking).toHaveProperty("memberId");
			expect(booking).toHaveProperty("status");
			expect(booking.bookingId).toMatch(/^booking-/);
			expect(["reserved", "cancelled", "attended", "no_show"]).toContain(booking.status);
		});

		it("createStaffFixtureが有効なスタッフデータを生成すること", () => {
			const staff = createStaffFixture();

			expect(staff).toHaveProperty("staffId");
			expect(staff).toHaveProperty("gymId");
			expect(staff).toHaveProperty("name");
			expect(staff).toHaveProperty("role");
			expect(staff).toHaveProperty("active");
			expect(staff.staffId).toMatch(/^staff-/);
			expect(["admin", "reception"]).toContain(staff.role);
			expect([0, 1]).toContain(staff.active);
		});
	});

	describe("validateFixtureData", () => {
		it("有効なフィクスチャデータの場合trueを返すこと", () => {
			const validGym = createGymFixture();
			expect(validateFixtureData("gyms", validGym)).toBe(true);

			const validMember = createMemberFixture();
			expect(validateFixtureData("members", validMember)).toBe(true);
		});

		it("必須フィールドが不足している場合falseを返すこと", () => {
			const invalidGym = { gymId: "gym-1" };
			expect(validateFixtureData("gyms", invalidGym)).toBe(false);

			const invalidMember = { memberId: "member-1" };
			expect(validateFixtureData("members", invalidMember)).toBe(false);
		});

		it("型が一致しない場合falseを返すこと", () => {
			const invalidGym = {
				gymId: "gym-1",
				name: "テストジム",
				ownerEmail: "invalid-email",
			};
			expect(validateFixtureData("gyms", invalidGym)).toBe(false);
		});
	});
});

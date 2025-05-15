/// <reference path="../../../worker-configuration.d.ts" />
import { randomUUID } from "node:crypto";
import type * as schema from "../../db/schema";
import type { InferFixtureType } from "./fixture-generator";

/**
 * テストデータ生成のためのファクトリー関数
 * 型安全なテストデータを簡単に生成するためのヘルパー関数群
 */

type GymFixtureType = Omit<
	Required<InferFixtureType<typeof schema.gyms>>,
	"createdAt" | "updatedAt"
> & {
	createdAt?: string;
	updatedAt?: string;
};

/**
 * ジムデータを生成するファクトリー関数
 * @param overrides 上書きする値
 * @returns ジムデータ
 */
export function createGymFixture(overrides: Partial<GymFixtureType> = {}): GymFixtureType {
	const timestamp = new Date().toISOString();

	return {
		gymId: overrides.gymId || randomUUID().slice(0, 8),
		name: overrides.name || `テストジム-${randomUUID().slice(0, 4)}`,
		ownerEmail: overrides.ownerEmail || `owner-${randomUUID().slice(0, 6)}@example.com`,
		createdAt: overrides.createdAt || timestamp,
		updatedAt: overrides.updatedAt || timestamp,
	};
}

type MemberFixtureType = Omit<
	Required<InferFixtureType<typeof schema.members>>,
	| "createdAt"
	| "updatedAt"
	| "status"
	| "joinedAt"
	| "policyVersion"
	| "policySignedAt"
	| "email"
	| "phone"
> & {
	status?: string;
	joinedAt?: string;
	policyVersion?: string;
	policySignedAt?: string;
	email?: string;
	phone?: string;
	createdAt?: string;
	updatedAt?: string;
};

/**
 * 会員データを生成するファクトリー関数
 * @param overrides 上書きする値
 * @returns 会員データ
 */
export function createMemberFixture(overrides: Partial<MemberFixtureType> = {}): MemberFixtureType {
	const timestamp = new Date().toISOString();

	return {
		memberId: overrides.memberId || randomUUID().slice(0, 8),
		gymId: overrides.gymId || randomUUID().slice(0, 8),
		name: overrides.name || `テスト会員-${randomUUID().slice(0, 4)}`,
		email: overrides.email || `member-${randomUUID().slice(0, 6)}@example.com`,
		status: overrides.status || "active",
		joinedAt: overrides.joinedAt || timestamp,
		createdAt: overrides.createdAt || timestamp,
		updatedAt: overrides.updatedAt || timestamp,
	};
}

type ClassFixtureType = Omit<
	Required<InferFixtureType<typeof schema.classes>>,
	"createdAt" | "updatedAt" | "instructor" | "capacity"
> & {
	instructor?: string;
	capacity?: number;
	createdAt?: string;
	updatedAt?: string;
};

/**
 * クラスデータを生成するファクトリー関数
 * @param overrides 上書きする値
 * @returns クラスデータ
 */
export function createClassFixture(overrides: Partial<ClassFixtureType> = {}): ClassFixtureType {
	const startDate = new Date();
	const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1時間後
	const timestamp = new Date().toISOString();

	return {
		classId: overrides.classId || randomUUID().slice(0, 8),
		gymId: overrides.gymId || randomUUID().slice(0, 8),
		title: overrides.title || `テストクラス-${randomUUID().slice(0, 4)}`,
		startsAt: overrides.startsAt || startDate.toISOString(),
		endsAt: overrides.endsAt || endDate.toISOString(),
		capacity: overrides.capacity || 10,
		instructor: overrides.instructor || `講師-${randomUUID().slice(0, 4)}`,
		createdAt: overrides.createdAt || timestamp,
		updatedAt: overrides.updatedAt || timestamp,
	};
}

type BookingFixtureType = Omit<
	Required<InferFixtureType<typeof schema.bookings>>,
	"status" | "bookedAt"
> & {
	status?: string;
	bookedAt?: string;
};

/**
 * 予約データを生成するファクトリー関数
 * @param overrides 上書きする値
 * @returns 予約データ
 */
export function createBookingFixture(
	overrides: Partial<BookingFixtureType> = {},
): BookingFixtureType {
	const timestamp = new Date().toISOString();

	return {
		bookingId: overrides.bookingId || randomUUID().slice(0, 8),
		gymId: overrides.gymId || randomUUID().slice(0, 8),
		classId: overrides.classId || randomUUID().slice(0, 8),
		memberId: overrides.memberId || randomUUID().slice(0, 8),
		status: overrides.status || "reserved",
		bookedAt: overrides.bookedAt || timestamp,
	};
}

type CheckinFixtureType = Omit<Required<InferFixtureType<typeof schema.checkins>>, "scannedAt"> & {
	scannedAt?: string;
};

/**
 * 入退館ログを生成するファクトリー関数
 * @param overrides 上書きする値
 * @returns 入退館ログデータ
 */
export function createCheckinFixture(
	overrides: Partial<CheckinFixtureType> = {},
): CheckinFixtureType {
	const timestamp = new Date().toISOString();

	return {
		checkinId: overrides.checkinId || randomUUID().slice(0, 8),
		gymId: overrides.gymId || randomUUID().slice(0, 8),
		memberId: overrides.memberId || randomUUID().slice(0, 8),
		scannedAt: overrides.scannedAt || timestamp,
	};
}

type StaffFixtureType = Omit<
	Required<InferFixtureType<typeof schema.staff>>,
	"role" | "email" | "active" | "createdAt"
> & {
	role?: string;
	email?: string;
	active?: number;
	createdAt?: string;
};

/**
 * スタッフデータを生成するファクトリー関数
 * @param overrides 上書きする値
 * @returns スタッフデータ
 */
export function createStaffFixture(overrides: Partial<StaffFixtureType> = {}): StaffFixtureType {
	const timestamp = new Date().toISOString();

	return {
		staffId: overrides.staffId || randomUUID().slice(0, 8),
		gymId: overrides.gymId || randomUUID().slice(0, 8),
		name: overrides.name || `テストスタッフ-${randomUUID().slice(0, 4)}`,
		email: overrides.email || `staff-${randomUUID().slice(0, 6)}@example.com`,
		role: overrides.role || "reception",
		active: overrides.active ?? 1,
		createdAt: overrides.createdAt || timestamp,
	};
}

type ShiftFixtureType = Omit<Required<InferFixtureType<typeof schema.shifts>>, "createdAt"> & {
	createdAt?: string;
};

/**
 * 勤務スケジュールを生成するファクトリー関数
 * @param overrides 上書きする値
 * @returns 勤務スケジュールデータ
 */
export function createShiftFixture(overrides: Partial<ShiftFixtureType> = {}): ShiftFixtureType {
	const startDate = new Date();
	const endDate = new Date(startDate.getTime() + 8 * 60 * 60 * 1000); // 8時間後
	const timestamp = new Date().toISOString();

	return {
		shiftId: overrides.shiftId || randomUUID().slice(0, 8),
		gymId: overrides.gymId || randomUUID().slice(0, 8),
		staffId: overrides.staffId || randomUUID().slice(0, 8),
		startsAt: overrides.startsAt || startDate.toISOString(),
		endsAt: overrides.endsAt || endDate.toISOString(),
		createdAt: overrides.createdAt || timestamp,
	};
}

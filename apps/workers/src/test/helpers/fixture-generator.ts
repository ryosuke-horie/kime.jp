import { v4 as uuidv4 } from "uuid";
import type { SchemaTypeMap, TableName } from "./schema-type-extractor";

export type FixtureOptions<T extends TableName> = Partial<SchemaTypeMap[T]["insert"]>;

const generateId = (prefix: string): string => `${prefix}-${uuidv4().slice(0, 8)}`;

const generateEmail = (): string => {
	const domains = ["example.com", "test.co.jp", "sample.org"];
	const randomDomain = domains[Math.floor(Math.random() * domains.length)];
	return `user${Math.floor(Math.random() * 10000)}@${randomDomain}`;
};

const generateName = (): string => {
	const firstNames = ["田中", "佐藤", "鈴木", "高橋", "渡辺", "山田", "中村"];
	const lastNames = ["太郎", "花子", "次郎", "三郎", "美香", "健太", "麻衣"];
	const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
	const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
	return `${firstName}${lastName}`;
};

const generateGymName = (): string => {
	const prefixes = ["フィットネス", "スポーツ", "トレーニング", "ボディ", "ヘルス"];
	const suffixes = ["ジム", "クラブ", "センター", "スタジオ", "パーク"];
	const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
	const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
	return `${prefix}${suffix}${Math.floor(Math.random() * 100) + 1}`;
};

const generateClassTitle = (): string => {
	const types = ["ヨガ", "ピラティス", "エアロビクス", "筋トレ", "ダンス", "ボクシング"];
	const levels = ["初心者", "中級者", "上級者", "オープン"];
	const type = types[Math.floor(Math.random() * types.length)];
	const level = levels[Math.floor(Math.random() * levels.length)];
	return `${type}（${level}）`;
};

const generateTimestamp = (): string => {
	const now = new Date();
	return now.toISOString();
};

const generateFutureTimestamp = (): string => {
	const futureDate = new Date();
	futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 1);
	return futureDate.toISOString();
};

export function createGymFixture(
	overrides?: FixtureOptions<"gyms">,
): SchemaTypeMap["gyms"]["insert"] {
	return {
		gymId: generateId("gym"),
		name: generateGymName(),
		ownerEmail: generateEmail(),
		passwordHash: null,
		createdAt: generateTimestamp(),
		updatedAt: generateTimestamp(),
		...overrides,
	};
}

export function createMemberFixture(
	overrides?: FixtureOptions<"members">,
): SchemaTypeMap["members"]["insert"] {
	const statuses = ["active", "suspended", "withdrawn"] as const;
	return {
		memberId: generateId("member"),
		gymId: generateId("gym"),
		name: generateName(),
		email: generateEmail(),
		phone: `090-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
		status: statuses[Math.floor(Math.random() * statuses.length)],
		joinedAt: generateTimestamp(),
		policyVersion: "1.0",
		policySignedAt: generateTimestamp(),
		createdAt: generateTimestamp(),
		updatedAt: generateTimestamp(),
		...overrides,
	};
}

export function createClassFixture(
	overrides?: FixtureOptions<"classes">,
): SchemaTypeMap["classes"]["insert"] {
	const startsAt = generateFutureTimestamp();
	const startsDate = new Date(startsAt);
	const endsDate = new Date(startsDate.getTime() + 60 * 60 * 1000); // 1時間後

	return {
		classId: generateId("class"),
		gymId: generateId("gym"),
		title: generateClassTitle(),
		startsAt,
		endsAt: endsDate.toISOString(),
		capacity: Math.floor(Math.random() * 20) + 5,
		instructor: generateName(),
		createdAt: generateTimestamp(),
		updatedAt: generateTimestamp(),
		...overrides,
	};
}

export function createBookingFixture(
	overrides?: FixtureOptions<"bookings">,
): SchemaTypeMap["bookings"]["insert"] {
	const statuses = ["reserved", "cancelled", "attended", "no_show"] as const;
	return {
		bookingId: generateId("booking"),
		gymId: generateId("gym"),
		classId: generateId("class"),
		memberId: generateId("member"),
		status: statuses[Math.floor(Math.random() * statuses.length)],
		bookedAt: generateTimestamp(),
		...overrides,
	};
}

export function createCheckinFixture(
	overrides?: FixtureOptions<"checkins">,
): SchemaTypeMap["checkins"]["insert"] {
	return {
		checkinId: generateId("checkin"),
		gymId: generateId("gym"),
		memberId: generateId("member"),
		scannedAt: generateTimestamp(),
		...overrides,
	};
}

export function createStaffFixture(
	overrides?: FixtureOptions<"staff">,
): SchemaTypeMap["staff"]["insert"] {
	const roles = ["admin", "reception"] as const;
	return {
		staffId: generateId("staff"),
		gymId: generateId("gym"),
		name: generateName(),
		email: generateEmail(),
		role: roles[Math.floor(Math.random() * roles.length)],
		active: Math.random() > 0.2 ? 1 : 0,
		createdAt: generateTimestamp(),
		...overrides,
	};
}

export function createClassStaffFixture(
	overrides?: FixtureOptions<"classStaff">,
): SchemaTypeMap["classStaff"]["insert"] {
	return {
		classId: generateId("class"),
		staffId: generateId("staff"),
		...overrides,
	};
}

export function createShiftFixture(
	overrides?: FixtureOptions<"shifts">,
): SchemaTypeMap["shifts"]["insert"] {
	const startsAt = generateFutureTimestamp();
	const startsDate = new Date(startsAt);
	const endsDate = new Date(startsDate.getTime() + 8 * 60 * 60 * 1000); // 8時間後

	return {
		shiftId: generateId("shift"),
		gymId: generateId("gym"),
		staffId: generateId("staff"),
		startsAt,
		endsAt: endsDate.toISOString(),
		createdAt: generateTimestamp(),
		...overrides,
	};
}

export function createAdminAccountFixture(
	overrides?: FixtureOptions<"adminAccounts">,
): SchemaTypeMap["adminAccounts"]["insert"] {
	const roles = ["admin", "staff"] as const;
	return {
		adminId: generateId("admin"),
		email: generateEmail(),
		name: generateName(),
		role: roles[Math.floor(Math.random() * roles.length)],
		passwordHash: null,
		isActive: Math.random() > 0.1 ? 1 : 0,
		lastLoginAt: generateTimestamp(),
		createdAt: generateTimestamp(),
		updatedAt: generateTimestamp(),
		...overrides,
	};
}

const fixtureGenerators = {
	gyms: createGymFixture,
	members: createMemberFixture,
	classes: createClassFixture,
	bookings: createBookingFixture,
	checkins: createCheckinFixture,
	staff: createStaffFixture,
	classStaff: createClassStaffFixture,
	shifts: createShiftFixture,
	adminAccounts: createAdminAccountFixture,
	adminOauthAccounts: (overrides?: any) => ({
		oauthId: generateId("oauth"),
		adminId: generateId("admin"),
		provider: "google",
		providerAccountId: generateId("provider"),
		...overrides,
	}),
	adminGymRelationships: (overrides?: any) => ({
		adminId: generateId("admin"),
		gymId: generateId("gym"),
		role: "staff",
		createdAt: generateTimestamp(),
		...overrides,
	}),
	consents: (overrides?: any) => ({
		consentId: generateId("consent"),
		memberId: generateId("member"),
		documentType: "privacy",
		version: "1.0",
		signedAt: generateTimestamp(),
		...overrides,
	}),
	aiConversations: (overrides?: any) => ({
		conversationId: generateId("conversation"),
		gymId: generateId("gym"),
		startedAt: generateTimestamp(),
		...overrides,
	}),
	aiMessages: (overrides?: any) => ({
		msgId: generateId("msg"),
		conversationId: generateId("conversation"),
		sender: "ai",
		channel: "web",
		...overrides,
	}),
	aiOutcomes: (overrides?: any) => ({
		outcomeId: generateId("outcome"),
		msgId: generateId("msg"),
		...overrides,
	}),
	suspensionPolicies: (overrides?: any) => ({
		gymId: generateId("gym"),
		feeType: "free",
		...overrides,
	}),
	payments: (overrides?: any) => ({
		orderId: generateId("order"),
		gymId: generateId("gym"),
		amount: Math.floor(Math.random() * 10000),
		currency: "JPY",
		status: "pending",
		createdAt: generateTimestamp(),
		updatedAt: generateTimestamp(),
		...overrides,
	}),
} as const;

export function createFixture<T extends TableName>(
	tableName: T,
	overrides?: FixtureOptions<T>,
): SchemaTypeMap[T]["insert"] {
	const generator = fixtureGenerators[tableName];
	return generator(overrides);
}

export function createMultipleFixtures<T extends TableName>(
	tableName: T,
	count: number,
	overridesArray?: FixtureOptions<T>[],
): SchemaTypeMap[T]["insert"][] {
	return Array.from({ length: count }, (_, index) => {
		const overrides = overridesArray?.[index];
		return createFixture(tableName, overrides);
	});
}

export function validateFixtureData<T extends TableName>(
	tableName: T,
	data: any,
): data is SchemaTypeMap[T]["insert"] {
	switch (tableName) {
		case "gyms":
			return (
				typeof data.gymId === "string" &&
				typeof data.name === "string" &&
				typeof data.ownerEmail === "string" &&
				/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.ownerEmail)
			);
		case "members":
			return (
				typeof data.memberId === "string" &&
				typeof data.gymId === "string" &&
				typeof data.name === "string" &&
				["active", "suspended", "withdrawn"].includes(data.status)
			);
		default:
			return true;
	}
}

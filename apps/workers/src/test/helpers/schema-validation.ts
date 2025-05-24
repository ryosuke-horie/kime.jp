import type { SchemaTypeMap, TableName } from "./schema-type-extractor";

export interface SchemaValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

export interface FieldMismatch {
	fieldName: string;
	reason: "missing_required" | "type_mismatch" | "extra_field" | "constraint_violation";
	expected?: string;
	actual?: string;
	details?: string;
}

export interface TableValidationReport {
	tableName: string;
	isValid: boolean;
	fixtureCount: number;
	errors: string[];
	warnings: string[];
	mismatches: FieldMismatch[];
}

export interface SchemaReport {
	summary: {
		totalTables: number;
		validTables: number;
		invalidTables: number;
		totalFixtures: number;
	};
	tableReports: Record<string, TableValidationReport>;
}

const requiredFields: Record<TableName, string[]> = {
	gyms: ["gymId", "name", "ownerEmail"],
	members: ["memberId", "gymId", "name", "status"],
	classes: ["classId", "gymId", "title", "startsAt", "endsAt", "capacity"],
	bookings: ["bookingId", "gymId", "classId", "memberId", "status"],
	checkins: ["checkinId", "gymId", "memberId"],
	staff: ["staffId", "gymId", "name", "role", "active"],
	classStaff: ["classId", "staffId"],
	shifts: ["shiftId", "gymId", "staffId", "startsAt", "endsAt"],
	adminAccounts: ["adminId", "email", "name", "role", "isActive"],
	adminOauthAccounts: ["oauthId", "adminId", "provider", "providerAccountId"],
	adminGymRelationships: ["adminId", "gymId", "role"],
	consents: ["consentId", "memberId", "documentType", "version"],
	aiConversations: ["conversationId", "gymId"],
	aiMessages: ["msgId", "conversationId", "sender", "channel"],
	aiOutcomes: ["outcomeId", "msgId"],
	suspensionPolicies: ["gymId", "feeType"],
	payments: ["orderId", "gymId", "amount", "currency", "status"],
};

const fieldTypes: Record<TableName, Record<string, "string" | "number" | "boolean">> = {
	gyms: {
		gymId: "string",
		name: "string",
		ownerEmail: "string",
		passwordHash: "string",
		createdAt: "string",
		updatedAt: "string",
	},
	members: {
		memberId: "string",
		gymId: "string",
		name: "string",
		email: "string",
		phone: "string",
		status: "string",
		joinedAt: "string",
		policyVersion: "string",
		policySignedAt: "string",
		createdAt: "string",
		updatedAt: "string",
	},
	classes: {
		classId: "string",
		gymId: "string",
		title: "string",
		startsAt: "string",
		endsAt: "string",
		capacity: "number",
		instructor: "string",
		createdAt: "string",
		updatedAt: "string",
	},
	bookings: {
		bookingId: "string",
		gymId: "string",
		classId: "string",
		memberId: "string",
		status: "string",
		bookedAt: "string",
	},
	checkins: {
		checkinId: "string",
		gymId: "string",
		memberId: "string",
		scannedAt: "string",
	},
	staff: {
		staffId: "string",
		gymId: "string",
		name: "string",
		email: "string",
		role: "string",
		active: "number",
		createdAt: "string",
	},
	classStaff: {
		classId: "string",
		staffId: "string",
	},
	shifts: {
		shiftId: "string",
		gymId: "string",
		staffId: "string",
		startsAt: "string",
		endsAt: "string",
		createdAt: "string",
	},
	adminAccounts: {
		adminId: "string",
		email: "string",
		name: "string",
		role: "string",
		passwordHash: "string",
		isActive: "number",
		lastLoginAt: "string",
		createdAt: "string",
		updatedAt: "string",
	},
	adminOauthAccounts: {
		oauthId: "string",
		adminId: "string",
		provider: "string",
		providerAccountId: "string",
		refreshToken: "string",
		accessToken: "string",
		expiresAt: "number",
		tokenType: "string",
		scope: "string",
		idToken: "string",
		createdAt: "string",
		updatedAt: "string",
	},
	adminGymRelationships: {
		adminId: "string",
		gymId: "string",
		role: "string",
		createdAt: "string",
	},
	consents: {
		consentId: "string",
		memberId: "string",
		documentType: "string",
		version: "string",
		signedAt: "string",
		signatureHash: "string",
	},
	aiConversations: {
		conversationId: "string",
		gymId: "string",
		memberId: "string",
		bookingId: "string",
		startedAt: "string",
		lastMsgAt: "string",
	},
	aiMessages: {
		msgId: "string",
		conversationId: "string",
		sender: "string",
		staffId: "string",
		channel: "string",
		content: "string",
		aiModel: "string",
		tokensIn: "number",
		tokensOut: "number",
		confidence: "string",
		sentAt: "string",
	},
	aiOutcomes: {
		outcomeId: "string",
		msgId: "string",
		autoReplied: "number",
		escalated: "number",
		overrideByStaff: "number",
		reason: "string",
		latencyMs: "number",
		createdAt: "string",
	},
	suspensionPolicies: {
		gymId: "string",
		feeType: "string",
		feeValue: "number",
		minTermMonths: "number",
		note: "string",
		updatedAt: "string",
	},
	payments: {
		orderId: "string",
		gymId: "string",
		memberId: "string",
		stripeSessionId: "string",
		stripePaymentIntent: "string",
		amount: "number",
		currency: "string",
		status: "string",
		paidAt: "string",
		createdAt: "string",
		updatedAt: "string",
	},
};

const nullableFields: Record<TableName, string[]> = {
	gyms: ["passwordHash"],
	members: ["email", "phone", "joinedAt", "policyVersion", "policySignedAt"],
	classes: ["instructor"],
	bookings: [],
	checkins: [],
	staff: ["email"],
	classStaff: [],
	shifts: [],
	adminAccounts: ["passwordHash", "lastLoginAt"],
	adminOauthAccounts: ["refreshToken", "accessToken", "expiresAt", "tokenType", "scope", "idToken"],
	adminGymRelationships: [],
	consents: ["signatureHash"],
	aiConversations: ["memberId", "bookingId", "lastMsgAt"],
	aiMessages: ["staffId", "content", "aiModel", "tokensIn", "tokensOut", "confidence"],
	aiOutcomes: ["reason", "latencyMs"],
	suspensionPolicies: ["feeValue", "note"],
	payments: ["memberId", "stripeSessionId", "stripePaymentIntent", "paidAt"],
};

const enumConstraints: Record<string, string[]> = {
	"members.status": ["active", "suspended", "withdrawn"],
	"staff.role": ["admin", "reception"],
	"bookings.status": ["reserved", "cancelled", "attended", "no_show"],
	"adminAccounts.role": ["admin", "staff"],
	"adminOauthAccounts.provider": ["google", "line"],
	"adminGymRelationships.role": ["owner", "manager", "staff"],
	"consents.documentType": ["privacy", "tos"],
	"aiMessages.sender": ["ai", "member", "staff"],
	"aiMessages.channel": ["line", "email", "web"],
	"suspensionPolicies.feeType": ["fixed", "percentage", "free"],
	"payments.status": ["pending", "succeeded", "failed", "refunded"],
};

export function validateSchemaConsistency<T extends TableName>(
	tableName: T,
	data: any,
): SchemaValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	// 必須フィールドのチェック
	const required = requiredFields[tableName] || [];
	for (const field of required) {
		if (!(field in data) || data[field] === undefined) {
			errors.push(`必須フィールド '${field}' が不足しています`);
		}
	}

	// 型のチェック
	const types = fieldTypes[tableName] || {};
	const nullable = nullableFields[tableName] || [];

	for (const [field, value] of Object.entries(data)) {
		if (field in types) {
			const expectedType = types[field];
			const isNullable = nullable.includes(field);

			if (expectedType && !checkFieldCompatibility(field, expectedType, value, isNullable)) {
				errors.push(
					`フィールド '${field}' の型が不正です。期待値: ${expectedType}, 実際の値: ${typeof value}`,
				);
			}
		}
	}

	// Enum制約のチェック
	for (const [field, value] of Object.entries(data)) {
		const constraintKey = `${tableName}.${field}`;
		if (constraintKey in enumConstraints) {
			const allowedValues = enumConstraints[constraintKey];
			if (allowedValues && value !== null && value !== undefined && typeof value === 'string' && !allowedValues.includes(value)) {
				errors.push(
					`フィールド '${field}' の値が制約に違反しています。許可された値: ${allowedValues?.join(", ") || ""}, 実際の値: ${value}`,
				);
			}
		}
	}

	// メールアドレスの形式チェック
	if ("ownerEmail" in data && data.ownerEmail) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(data.ownerEmail)) {
			errors.push("ownerEmailの形式が不正です");
		}
	}

	if ("email" in data && data.email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(data.email)) {
			errors.push("emailの形式が不正です");
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

export function checkFieldCompatibility(
	fieldName: string,
	expectedType: "string" | "number" | "boolean",
	value: any,
	isNullable = false,
): boolean {
	if (value === null || value === undefined) {
		return isNullable;
	}

	switch (expectedType) {
		case "string":
			return typeof value === "string";
		case "number":
			return typeof value === "number";
		case "boolean":
			return typeof value === "boolean";
		default:
			return false;
	}
}

export function detectSchemaMismatch<T extends TableName>(
	tableName: T,
	data: any,
): FieldMismatch[] {
	const mismatches: FieldMismatch[] = [];
	const expectedFields = fieldTypes[tableName] || {};
	const required = requiredFields[tableName] || [];
	const nullable = nullableFields[tableName] || [];

	// 必須フィールドの不足チェック
	for (const field of required) {
		if (!(field in data) || data[field] === undefined) {
			mismatches.push({
				fieldName: field,
				reason: "missing_required",
				expected: "required field",
				actual: "undefined",
			});
		}
	}

	// 型の不一致チェック
	for (const [field, value] of Object.entries(data)) {
		if (field in expectedFields) {
			const expectedType = expectedFields[field];
			const isNullable = nullable.includes(field);

			if (expectedType && !checkFieldCompatibility(field, expectedType, value, isNullable)) {
				mismatches.push({
					fieldName: field,
					reason: "type_mismatch",
					expected: expectedType,
					actual: typeof value,
				});
			}
		} else {
			// スキーマに存在しないフィールド
			mismatches.push({
				fieldName: field,
				reason: "extra_field",
				details: "このフィールドはスキーマに定義されていません",
			});
		}
	}

	// Enum制約違反チェック
	for (const [field, value] of Object.entries(data)) {
		const constraintKey = `${tableName}.${field}`;
		if (constraintKey in enumConstraints) {
			const allowedValues = enumConstraints[constraintKey];
			if (allowedValues && value !== null && value !== undefined && typeof value === 'string' && !allowedValues.includes(value)) {
				mismatches.push({
					fieldName: field,
					reason: "constraint_violation",
					expected: allowedValues?.join(" | ") || "",
					actual: String(value),
				});
			}
		}
	}

	return mismatches;
}

export function generateSchemaReport(fixtures: Record<string, any[]>): SchemaReport {
	const tableReports: Record<string, TableValidationReport> = {};
	let totalTables = 0;
	let validTables = 0;
	let invalidTables = 0;
	let totalFixtures = 0;

	for (const [tableName, fixtureArray] of Object.entries(fixtures)) {
		if (tableName in fieldTypes) {
			totalTables++;
			totalFixtures += fixtureArray.length;

			const errors: string[] = [];
			const warnings: string[] = [];
			const allMismatches: FieldMismatch[] = [];
			let isTableValid = true;

			for (const [index, fixture] of fixtureArray.entries()) {
				const validation = validateSchemaConsistency(tableName as TableName, fixture);
				const mismatches = detectSchemaMismatch(tableName as TableName, fixture);

				if (!validation.isValid) {
					isTableValid = false;
					errors.push(`フィクスチャ[${index}]: ${validation.errors.join(", ")}`);
				}

				warnings.push(...validation.warnings.map((w) => `フィクスチャ[${index}]: ${w}`));
				allMismatches.push(...mismatches);
			}

			if (isTableValid) {
				validTables++;
			} else {
				invalidTables++;
			}

			tableReports[tableName] = {
				tableName,
				isValid: isTableValid,
				fixtureCount: fixtureArray.length,
				errors,
				warnings,
				mismatches: allMismatches,
			};
		}
	}

	return {
		summary: {
			totalTables,
			validTables,
			invalidTables,
			totalFixtures,
		},
		tableReports,
	};
}

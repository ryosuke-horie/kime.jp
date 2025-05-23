import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import * as schema from "../../db/schema";

export type SchemaTypeMap = {
	gyms: {
		insert: InferInsertModel<typeof schema.gyms>;
		select: InferSelectModel<typeof schema.gyms>;
	};
	members: {
		insert: InferInsertModel<typeof schema.members>;
		select: InferSelectModel<typeof schema.members>;
	};
	classes: {
		insert: InferInsertModel<typeof schema.classes>;
		select: InferSelectModel<typeof schema.classes>;
	};
	bookings: {
		insert: InferInsertModel<typeof schema.bookings>;
		select: InferSelectModel<typeof schema.bookings>;
	};
	checkins: {
		insert: InferInsertModel<typeof schema.checkins>;
		select: InferSelectModel<typeof schema.checkins>;
	};
	staff: {
		insert: InferInsertModel<typeof schema.staff>;
		select: InferSelectModel<typeof schema.staff>;
	};
	classStaff: {
		insert: InferInsertModel<typeof schema.classStaff>;
		select: InferSelectModel<typeof schema.classStaff>;
	};
	shifts: {
		insert: InferInsertModel<typeof schema.shifts>;
		select: InferSelectModel<typeof schema.shifts>;
	};
	adminAccounts: {
		insert: InferInsertModel<typeof schema.adminAccounts>;
		select: InferSelectModel<typeof schema.adminAccounts>;
	};
	adminOauthAccounts: {
		insert: InferInsertModel<typeof schema.adminOauthAccounts>;
		select: InferSelectModel<typeof schema.adminOauthAccounts>;
	};
	adminGymRelationships: {
		insert: InferInsertModel<typeof schema.adminGymRelationships>;
		select: InferSelectModel<typeof schema.adminGymRelationships>;
	};
	consents: {
		insert: InferInsertModel<typeof schema.consents>;
		select: InferSelectModel<typeof schema.consents>;
	};
	aiConversations: {
		insert: InferInsertModel<typeof schema.aiConversations>;
		select: InferSelectModel<typeof schema.aiConversations>;
	};
	aiMessages: {
		insert: InferInsertModel<typeof schema.aiMessages>;
		select: InferSelectModel<typeof schema.aiMessages>;
	};
	aiOutcomes: {
		insert: InferInsertModel<typeof schema.aiOutcomes>;
		select: InferSelectModel<typeof schema.aiOutcomes>;
	};
	suspensionPolicies: {
		insert: InferInsertModel<typeof schema.suspensionPolicies>;
		select: InferSelectModel<typeof schema.suspensionPolicies>;
	};
	payments: {
		insert: InferInsertModel<typeof schema.payments>;
		select: InferSelectModel<typeof schema.payments>;
	};
};

export type TableName = keyof SchemaTypeMap;

const schemaTableMap = {
	gyms: schema.gyms,
	members: schema.members,
	classes: schema.classes,
	bookings: schema.bookings,
	checkins: schema.checkins,
	staff: schema.staff,
	classStaff: schema.classStaff,
	shifts: schema.shifts,
	adminAccounts: schema.adminAccounts,
	adminOauthAccounts: schema.adminOauthAccounts,
	adminGymRelationships: schema.adminGymRelationships,
	consents: schema.consents,
	aiConversations: schema.aiConversations,
	aiMessages: schema.aiMessages,
	aiOutcomes: schema.aiOutcomes,
	suspensionPolicies: schema.suspensionPolicies,
	payments: schema.payments,
} as const;

export function extractSchemaTypes(): SchemaTypeMap {
	// 実際の実装では、スキーマからドリズルの型を抽出
	// 現在はTypeScriptの型システムを活用
	return {
		gyms: { insert: {} as any, select: {} as any },
		members: { insert: {} as any, select: {} as any },
		classes: { insert: {} as any, select: {} as any },
		bookings: { insert: {} as any, select: {} as any },
		checkins: { insert: {} as any, select: {} as any },
		staff: { insert: {} as any, select: {} as any },
		classStaff: { insert: {} as any, select: {} as any },
		shifts: { insert: {} as any, select: {} as any },
		adminAccounts: { insert: {} as any, select: {} as any },
		adminOauthAccounts: { insert: {} as any, select: {} as any },
		adminGymRelationships: { insert: {} as any, select: {} as any },
		consents: { insert: {} as any, select: {} as any },
		aiConversations: { insert: {} as any, select: {} as any },
		aiMessages: { insert: {} as any, select: {} as any },
		aiOutcomes: { insert: {} as any, select: {} as any },
		suspensionPolicies: { insert: {} as any, select: {} as any },
		payments: { insert: {} as any, select: {} as any },
	};
}

export function getTableNames(): TableName[] {
	return Object.keys(schemaTableMap) as TableName[];
}

export function validateTableSchema(tableName: string): tableName is TableName {
	return tableName in schemaTableMap;
}

export function getTableSchema(tableName: TableName) {
	return schemaTableMap[tableName];
}

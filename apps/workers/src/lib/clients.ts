import type { Env } from "../env";
import { Database, getDatabase } from "./database";

/**
 * ルーターで使用するために以前のDOを使用したgetDatabaseClient関数と
 * 同様のインターフェースでD1を直接使用する関数を提供
 */
export function getDatabaseClient(env: Env) {
	const db = getDatabase(env);
	return {
		getOne: (table: string, id: string) => db.getOne(table as any, id),
		list: (table: string, params: Record<string, string> = {}) => {
			return db.list(table as any, {
				gymId: params.gym_id,
				limit: params.limit ? Number.parseInt(params.limit) : undefined,
				offset: params.offset ? Number.parseInt(params.offset) : undefined,
			});
		},
		create: (table: string, data: Record<string, unknown>) => db.create(table, data),
		update: (table: string, id: string, data: Record<string, unknown>) =>
			db.update(table, id, data),
		delete: (table: string, id: string) => db.delete(table, id),
		query: async <T = unknown>(
			sql: string,
		): Promise<{ success: boolean; data?: T; error?: string }> => {
			try {
				const client = db.getClient();
				const result = await client.execute(sql);
				return { success: true, data: result as T };
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				return { success: false, error: errorMessage };
			}
		},
		queryOne: async <T = Record<string, unknown>>(
			_table: string,
			_conditions: Record<string, unknown>,
		): Promise<{ success: boolean; data?: T; error?: string }> => {
			// この関数はDoからの移行のために必要だが、今は単純化のためサポートしない
			return { success: false, error: "queryOne not supported in direct D1 client" };
		},
		queryMany: async <T = Record<string, unknown>[]>(
			_table: string,
			_conditions: Record<string, unknown>,
		): Promise<{ success: boolean; data?: T; error?: string }> => {
			// この関数はDoからの移行のために必要だが、今は単純化のためサポートしない
			return { success: false, error: "queryMany not supported in direct D1 client" };
		},
		transaction: async (_queries: string[]): Promise<{ success: boolean; error?: string }> => {
			// D1トランザクションは現在のD1 APIではサポートされていない
			return { success: false, error: "Transaction not supported in D1" };
		},
	};
}

/**
 * 予約機能のためのヘルパー関数
 */
export async function bookClass(
	env: Env,
	data: {
		gymId: string;
		classId: string;
		memberId: string;
	},
): Promise<{
	success: boolean;
	bookingId?: string;
	error?: string;
}> {
	const db = getDatabase(env);
	return db.bookClass(data);
}

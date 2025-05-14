import { drizzle } from "drizzle-orm/d1";
import type { Env } from "hono";
import * as schema from "./schema";

/**
 * D1データベースのDrizzleクライアントを作成する
 * @param env Honoのバインディング環境
 * @returns Drizzleクライアントインスタンス
 */
export function createDb(env: Env) {
	return drizzle(env.DB, { schema });
}

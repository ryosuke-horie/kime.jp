import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/**
 * D1データベースのDrizzleクライアントを作成する
 * @param env Honoのバインディング環境
 * @returns Drizzleクライアントインスタンス
 */
export function createDb(env: CloudflareBindings) {
	return drizzle(env.DB, { schema });
}

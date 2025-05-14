import { count, desc, asc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { Gym } from "../db";
import { gyms } from "../db/schema";

/**
 * ジムリポジトリのインターフェース
 */
export interface IGymRepository {
  findAll(options: {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
  }): Promise<{ 
    items: Gym[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;
  findById(gymId: string): Promise<Gym | undefined>;
  create(data: {
    gymId: string;
    name: string;
    ownerEmail: string;
  }): Promise<Gym | undefined>;
  update(
    gymId: string, 
    data: Partial<{ name: string; ownerEmail: string }>
  ): Promise<Gym | undefined>;
  delete(gymId: string): Promise<boolean>;
}

/**
 * ジムリポジトリの実装 - Drizzle + D1を使用
 */
export class GymRepository implements IGymRepository {
	private db;

	constructor(d1: D1Database) {
		this.db = drizzle(d1, { schema: { gyms } });
	}

	/**
	 * ジム一覧を取得する
	 * @param options 取得オプション
	 * @returns ジム一覧とページネーション情報
	 */
	async findAll(options: {
		page?: number;
		limit?: number;
		sort?: string;
		search?: string;
	}) {
		const { 
			page = 1, 
			limit = 10, 
			sort = "-createdAt", 
			search 
		} = options;
		
		const offset = (page - 1) * limit;
		
		// 基本クエリ
		let query = this.db.select().from(gyms);
		
		// 検索条件があれば適用
		if (search) {
			query = query.where(
				or(
					like(gyms.name, `%${search}%`),
					like(gyms.ownerEmail, `%${search}%`)
				)
			);
		}
		
		// 合計件数を取得
		const countResult = await this.db
			.select({ value: count() })
			.from(gyms)
			.execute();
		const total = countResult[0]?.value || 0;
		
		// ソート条件を適用
		switch (sort) {
			case "name":
				query = query.orderBy(asc(gyms.name));
				break;
			case "-name":
				query = query.orderBy(desc(gyms.name));
				break;
			case "createdAt":
				query = query.orderBy(asc(gyms.createdAt));
				break;
			case "-createdAt":
				query = query.orderBy(desc(gyms.createdAt));
				break;
			default:
				// デフォルトは作成日の降順
				query = query.orderBy(desc(gyms.createdAt));
		}
		
		// ページネーションを適用
		query = query.limit(limit).offset(offset);
		
		// クエリ実行
		const results = await query.execute();
		
		// ページネーションメタデータの計算
		const totalPages = Math.ceil(total / limit);
		
		return {
			items: results as Gym[],
			meta: {
				total,
				page,
				limit,
				totalPages,
			},
		};
	}

	/**
	 * 特定のジムをIDで取得する
	 * @param gymId ジムID
	 * @returns ジム情報、存在しない場合はnull
	 */
	async findById(gymId: string) {
		const result = await this.db
			.select()
			.from(gyms)
			.where(eq(gyms.gymId, gymId))
			.execute();
		
		return result[0] as Gym | undefined;
	}

	/**
	 * 新しいジムを作成する
	 * @param data ジム情報
	 * @returns 作成されたジム情報
	 */
	async create(data: {
		gymId: string;
		name: string;
		ownerEmail: string;
	}) {
		const now = new Date().toISOString();
		
		await this.db.insert(gyms).values({
			gymId: data.gymId,
			name: data.name,
			ownerEmail: data.ownerEmail,
			createdAt: now,
			updatedAt: now,
		}).execute();
		
		return this.findById(data.gymId);
	}

	/**
	 * ジム情報を更新する
	 * @param gymId ジムID
	 * @param data 更新データ
	 * @returns 更新後のジム情報
	 */
	async update(
		gymId: string,
		data: Partial<{ name: string; ownerEmail: string }>
	) {
		if (Object.keys(data).length === 0) {
			return this.findById(gymId);
		}
		
		const now = new Date().toISOString();
		
		await this.db
			.update(gyms)
			.set({
				...data,
				updatedAt: now,
			})
			.where(eq(gyms.gymId, gymId))
			.execute();
		
		return this.findById(gymId);
	}

	/**
	 * ジムを削除する
	 * @param gymId ジムID
	 * @returns 削除に成功したかどうか
	 */
	async delete(gymId: string) {
		const result = await this.db
			.delete(gyms)
			.where(eq(gyms.gymId, gymId))
			.execute();
		
		return result.changes > 0;
	}
}
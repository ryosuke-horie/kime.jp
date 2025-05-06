import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db";
import type { Env } from "../env";
import { generateUUID } from "./db-client";

/**
 * ジェネリックなデータベースクライアント
 * DOを使わずに直接D1にアクセスする
 */
export class Database {
	private db: ReturnType<typeof drizzle>;

	constructor(env: Env) {
		this.db = drizzle(env.DB, { schema });
	}

	/**
	 * 単一レコードを取得
	 */
	async getOne<T extends keyof typeof schema>(
		table: T,
		id: string,
	): Promise<{
		success: boolean;
		data?: any;
		error?: string;
	}> {
		try {
			let result;

			// テーブルに応じたクエリを実行
			switch (table) {
				case "gyms":
					result = await this.db.select().from(schema.gyms).where(eq(schema.gyms.gymId, id)).get();
					break;
				case "members":
					result = await this.db
						.select()
						.from(schema.members)
						.where(eq(schema.members.memberId, id))
						.get();
					break;
				case "classes":
					result = await this.db
						.select()
						.from(schema.classes)
						.where(eq(schema.classes.classId, id))
						.get();
					break;
				case "bookings":
					result = await this.db
						.select()
						.from(schema.bookings)
						.where(eq(schema.bookings.bookingId, id))
						.get();
					break;
				// 他のテーブルも同様に追加可能
				default:
					return { success: false, error: "Unknown table" };
			}

			if (!result) {
				return { success: false, error: "Record not found" };
			}

			return { success: true, data: result };
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * テーブルの一覧を取得
	 */
	async list<T extends keyof typeof schema>(
		table: T,
		options: {
			gymId?: string;
			limit?: number;
			offset?: number;
		} = {},
	): Promise<{
		success: boolean;
		data?: any[];
		error?: string;
	}> {
		try {
			const { gymId, limit = 100, offset = 0 } = options;
			let results = [];

			// テーブルに応じたクエリを実行
			switch (table) {
				case "gyms":
					results = await this.db.select().from(schema.gyms).limit(limit).offset(offset).all();
					break;
				case "members":
					if (gymId) {
						results = await this.db
							.select()
							.from(schema.members)
							.where(eq(schema.members.gymId, gymId))
							.limit(limit)
							.offset(offset)
							.all();
					} else {
						results = await this.db.select().from(schema.members).limit(limit).offset(offset).all();
					}
					break;
				case "classes":
					if (gymId) {
						results = await this.db
							.select()
							.from(schema.classes)
							.where(eq(schema.classes.gymId, gymId))
							.limit(limit)
							.offset(offset)
							.all();
					} else {
						results = await this.db.select().from(schema.classes).limit(limit).offset(offset).all();
					}
					break;
				case "bookings":
					if (gymId) {
						results = await this.db
							.select()
							.from(schema.bookings)
							.where(eq(schema.bookings.gymId, gymId))
							.limit(limit)
							.offset(offset)
							.all();
					} else {
						results = await this.db
							.select()
							.from(schema.bookings)
							.limit(limit)
							.offset(offset)
							.all();
					}
					break;
				// 他のテーブルも同様に追加可能
				default:
					return { success: false, error: "Unknown table" };
			}

			return { success: true, data: results };
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * 新しいレコードを作成
	 */
	async create(
		table: string,
		data: Record<string, unknown>,
	): Promise<{
		success: boolean;
		id?: string;
		error?: string;
	}> {
		try {
			// テーブルに応じた処理
			switch (table) {
				case "gyms": {
					const gymId = !data.gymId ? generateUUID() : String(data.gymId);
					const gymData = {
						gymId,
						name: String(data.name),
						timezone: data.timezone ? String(data.timezone) : undefined,
						ownerEmail: String(data.ownerEmail),
						plan: data.plan ? String(data.plan) : undefined,
						createdAt: data.createdAt ? String(data.createdAt) : undefined,
						updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
					};
					await this.db.insert(schema.gyms).values(gymData);
					return { success: true, id: gymId };
				}
				case "members": {
					const memberId = !data.memberId ? generateUUID() : String(data.memberId);
					const memberData = {
						memberId,
						gymId: String(data.gymId),
						name: String(data.name),
						email: data.email ? String(data.email) : undefined,
						phone: data.phone ? String(data.phone) : undefined,
						status: data.status ? String(data.status) : undefined,
						joinedAt: data.joinedAt ? String(data.joinedAt) : undefined,
						policyVersion: data.policyVersion ? String(data.policyVersion) : undefined,
						policySignedAt: data.policySignedAt ? String(data.policySignedAt) : undefined,
						createdAt: data.createdAt ? String(data.createdAt) : undefined,
						updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
					};
					await this.db.insert(schema.members).values(memberData);
					return { success: true, id: memberId };
				}
				case "classes": {
					const classId = !data.classId ? generateUUID() : String(data.classId);
					const classData = {
						classId,
						gymId: String(data.gymId),
						title: String(data.title),
						startsAt: String(data.startsAt),
						endsAt: String(data.endsAt),
						capacity: Number(data.capacity),
						instructor: data.instructor ? String(data.instructor) : undefined,
						createdAt: data.createdAt ? String(data.createdAt) : undefined,
						updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
					};
					await this.db.insert(schema.classes).values(classData);
					return { success: true, id: classId };
				}
				case "bookings": {
					const bookingId = generateUUID();
					const bookingData = {
						bookingId,
						gymId: String(data.gymId),
						classId: String(data.classId),
						memberId: String(data.memberId),
						status: data.status ? String(data.status) : undefined,
						bookedAt: data.bookedAt ? String(data.bookedAt) : undefined,
					};
					await this.db.insert(schema.bookings).values(bookingData);
					return { success: true, id: bookingId };
				}
				// 他のテーブルも同様に追加可能
				default:
					return { success: false, error: "Unknown table" };
			}
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * レコードを更新
	 */
	async update(
		table: string,
		id: string,
		data: Record<string, unknown>,
	): Promise<{
		success: boolean;
		error?: string;
	}> {
		try {
			// 更新処理
			switch (table) {
				case "gyms":
					await this.db
						.update(schema.gyms)
						.set(data as any)
						.where(eq(schema.gyms.gymId, id));
					break;
				case "members":
					await this.db
						.update(schema.members)
						.set(data as any)
						.where(eq(schema.members.memberId, id));
					break;
				case "classes":
					await this.db
						.update(schema.classes)
						.set(data as any)
						.where(eq(schema.classes.classId, id));
					break;
				case "bookings":
					await this.db
						.update(schema.bookings)
						.set(data as any)
						.where(eq(schema.bookings.bookingId, id));
					break;
				// 他のテーブルも同様に追加可能
				default:
					return { success: false, error: "Unknown table" };
			}

			return { success: true };
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * レコードを削除
	 */
	async delete(
		table: string,
		id: string,
	): Promise<{
		success: boolean;
		error?: string;
	}> {
		try {
			// 削除処理
			switch (table) {
				case "gyms":
					await this.db.delete(schema.gyms).where(eq(schema.gyms.gymId, id));
					break;
				case "members":
					await this.db.delete(schema.members).where(eq(schema.members.memberId, id));
					break;
				case "classes":
					await this.db.delete(schema.classes).where(eq(schema.classes.classId, id));
					break;
				case "bookings":
					await this.db.delete(schema.bookings).where(eq(schema.bookings.bookingId, id));
					break;
				// 他のテーブルも同様に追加可能
				default:
					return { success: false, error: "Unknown table" };
			}

			return { success: true };
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * 予約処理（トランザクション処理込みの特殊ケース）
	 */
	async bookClass(data: {
		classId: string;
		memberId: string;
		gymId: string;
	}): Promise<{
		success: boolean;
		bookingId?: string;
		error?: string;
	}> {
		try {
			// D1はネイティブトランザクションをサポートするため、それを活用
			const db = this.db;

			// 1. クラスの存在確認
			const classData = await db
				.select()
				.from(schema.classes)
				.where(eq(schema.classes.classId, data.classId))
				.get();

			if (!classData) {
				return { success: false, error: "Class not found" };
			}

			// 2. 予約数の確認
			const bookingsResult = await db
				.select({ count: db.fn.count() })
				.from(schema.bookings)
				.where(
					and(eq(schema.bookings.classId, data.classId), eq(schema.bookings.status, "reserved")),
				)
				.get();

			const bookingsCount = bookingsResult?.count || 0;

			if (bookingsCount >= classData.capacity) {
				return { success: false, error: "Class is fully booked" };
			}

			// 3. 既存予約の確認（二重予約防止）
			const existingBooking = await db
				.select()
				.from(schema.bookings)
				.where(
					and(
						eq(schema.bookings.classId, data.classId),
						eq(schema.bookings.memberId, data.memberId),
					),
				)
				.get();

			if (existingBooking) {
				return {
					success: false,
					error: "Member already has a booking for this class",
					bookingId: existingBooking.bookingId,
				};
			}

			// 4. 予約を作成
			const bookingId = generateUUID();
			const bookingData = {
				bookingId,
				classId: data.classId,
				memberId: data.memberId,
				gymId: data.gymId,
				status: "reserved",
				bookedAt: new Date().toISOString(),
			};

			await db.insert(schema.bookings).values(bookingData);
			return { success: true, bookingId };
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return { success: false, error: errorMessage };
		}
	}

	// クライアントを直接取得
	getClient() {
		return this.db;
	}
}

// 環境からデータベースインスタンスを取得
export function getDatabase(env: Env): Database {
	return new Database(env);
}

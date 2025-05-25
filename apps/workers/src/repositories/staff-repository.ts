/// <reference path="../../worker-configuration.d.ts" />
import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { Staff } from "../db";
import { staff } from "../db/schema";

/**
 * スタッフリポジトリのインターフェース
 */
export interface IStaffRepository {
	findByGymId(gymId: string): Promise<Staff[]>;
	findById(staffId: string): Promise<Staff | undefined>;
	findByEmail(email: string, gymId: string): Promise<Staff | undefined>;
	create(data: {
		staffId: string;
		gymId: string;
		name: string;
		email: string;
		role: "admin" | "reception";
		passwordHash: string;
		active?: boolean;
	}): Promise<Staff | undefined>;
	update(
		staffId: string,
		data: Partial<{
			name: string;
			email: string;
			role: "admin" | "reception";
			active: boolean;
		}>,
	): Promise<Staff | undefined>;
	updatePassword(staffId: string, passwordHash: string): Promise<boolean>;
	updateLastLogin(staffId: string): Promise<boolean>;
	delete(staffId: string): Promise<boolean>;
}

/**
 * スタッフリポジトリの実装 - Drizzle + D1を使用
 */
export class StaffRepository implements IStaffRepository {
	private db;

	constructor(d1: CloudflareBindings["DB"]) {
		this.db = drizzle(d1, { schema: { staff } });
	}

	/**
	 * 指定されたジムのスタッフ一覧を取得する
	 * @param gymId ジムID
	 * @returns スタッフ一覧
	 */
	async findByGymId(gymId: string): Promise<Staff[]> {
		const results = await this.db
			.select()
			.from(staff)
			.where(eq(staff.gymId, gymId))
			.orderBy(desc(staff.createdAt))
			.execute();

		return results as Staff[];
	}

	/**
	 * 特定のスタッフをIDで取得する
	 * @param staffId スタッフID
	 * @returns スタッフ情報、存在しない場合はundefined
	 */
	async findById(staffId: string): Promise<Staff | undefined> {
		const result = await this.db.select().from(staff).where(eq(staff.staffId, staffId)).execute();

		return result[0] as Staff | undefined;
	}

	/**
	 * メールアドレスでスタッフを検索する（ジム内での重複チェック用）
	 * @param email メールアドレス
	 * @param gymId ジムID
	 * @returns スタッフ情報、存在しない場合はundefined
	 */
	async findByEmail(email: string, gymId: string): Promise<Staff | undefined> {
		const result = await this.db
			.select()
			.from(staff)
			.where(and(eq(staff.email, email), eq(staff.gymId, gymId)))
			.execute();

		return result[0] as Staff | undefined;
	}

	/**
	 * 新しいスタッフを作成する
	 * @param data スタッフ情報
	 * @returns 作成されたスタッフ情報
	 */
	async create(data: {
		staffId: string;
		gymId: string;
		name: string;
		email: string;
		role: "admin" | "reception";
		passwordHash: string;
		active?: boolean;
	}): Promise<Staff | undefined> {
		const now = new Date().toISOString();

		await this.db
			.insert(staff)
			.values({
				staffId: data.staffId,
				gymId: data.gymId,
				name: data.name,
				email: data.email,
				role: data.role,
				passwordHash: data.passwordHash,
				active: data.active !== false ? 1 : 0, // デフォルトはアクティブ
				lastLoginAt: null,
				createdAt: now,
			})
			.execute();

		return this.findById(data.staffId);
	}

	/**
	 * スタッフ情報を更新する
	 * @param staffId スタッフID
	 * @param data 更新データ
	 * @returns 更新後のスタッフ情報
	 */
	async update(
		staffId: string,
		data: Partial<{
			name: string;
			email: string;
			role: "admin" | "reception";
			active: boolean;
		}>,
	): Promise<Staff | undefined> {
		if (Object.keys(data).length === 0) {
			return this.findById(staffId);
		}

		// activeフィールドをintegerに変換
		const updateData: any = { ...data };
		if (data.active !== undefined) {
			updateData.active = data.active ? 1 : 0;
		}

		await this.db.update(staff).set(updateData).where(eq(staff.staffId, staffId)).execute();

		return this.findById(staffId);
	}

	/**
	 * スタッフのパスワードを更新する
	 * @param staffId スタッフID
	 * @param passwordHash 新しいパスワードハッシュ
	 * @returns 更新に成功したかどうか
	 */
	async updatePassword(staffId: string, passwordHash: string): Promise<boolean> {
		try {
			// 存在確認
			const existingStaff = await this.findById(staffId);
			if (!existingStaff) {
				return false;
			}

			await this.db.update(staff).set({ passwordHash }).where(eq(staff.staffId, staffId)).execute();

			return true;
		} catch (error) {
			console.error(`Failed to update password for staff ${staffId}:`, error);
			return false;
		}
	}

	/**
	 * スタッフの最終ログイン時間を更新する
	 * @param staffId スタッフID
	 * @returns 更新に成功したかどうか
	 */
	async updateLastLogin(staffId: string): Promise<boolean> {
		try {
			const now = new Date().toISOString();

			await this.db
				.update(staff)
				.set({ lastLoginAt: now })
				.where(eq(staff.staffId, staffId))
				.execute();

			return true;
		} catch (error) {
			console.error(`Failed to update last login for staff ${staffId}:`, error);
			return false;
		}
	}

	/**
	 * スタッフを削除する
	 * @param staffId スタッフID
	 * @returns 削除に成功したかどうか
	 */
	async delete(staffId: string): Promise<boolean> {
		try {
			// 削除前に存在確認
			const existingStaff = await this.findById(staffId);
			if (!existingStaff) {
				return false;
			}

			// スタッフを削除すると、ON DELETE CASCADEによって関連するデータも削除される
			await this.db.delete(staff).where(eq(staff.staffId, staffId)).execute();

			// 削除後に存在確認
			const deletedStaff = await this.findById(staffId);
			return deletedStaff === undefined;
		} catch (error) {
			console.error(`Failed to delete staff with ID ${staffId}:`, error);
			return false;
		}
	}
}

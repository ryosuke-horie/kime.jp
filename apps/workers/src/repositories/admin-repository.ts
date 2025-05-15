/// <reference path="../../worker-configuration.d.ts" />
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { v4 as uuidv4 } from "uuid";
import { adminAccounts, adminGymRelationships } from "../db/schema";

/**
 * 管理者リポジトリのインターフェース
 */
export interface IAdminRepository {
	findAdminByEmail(
		email: string,
	): Promise<{ adminId: string; email: string; name: string; role: string } | undefined>;
	findOrCreateAdminAccount(data: {
		email: string;
		name: string;
		role: "admin" | "staff";
	}): Promise<string>;
	createGymRelationship(data: {
		adminId: string;
		gymId: string;
		role: "owner" | "manager" | "staff";
	}): Promise<boolean>;
	getGymRelationship(
		adminId: string,
		gymId: string,
	): Promise<
		| {
				adminId: string;
				gymId: string;
				role: string;
		  }
		| undefined
	>;
}

/**
 * 管理者リポジトリの実装 - Drizzle + D1を使用
 */
export class AdminRepository implements IAdminRepository {
	private db;

	constructor(d1: CloudflareBindings["DB"]) {
		this.db = drizzle(d1, { schema: { adminAccounts, adminGymRelationships } });
	}

	/**
	 * メールアドレスから管理者を検索する
	 * @param email メールアドレス
	 * @returns 管理者情報、存在しない場合はundefined
	 */
	async findAdminByEmail(email: string) {
		const result = await this.db
			.select({
				adminId: adminAccounts.adminId,
				email: adminAccounts.email,
				name: adminAccounts.name,
				role: adminAccounts.role,
			})
			.from(adminAccounts)
			.where(eq(adminAccounts.email, email))
			.execute();

		return result[0];
	}

	/**
	 * 管理者アカウントを検索し、存在しない場合は新規作成する
	 * @param data 管理者情報
	 * @returns 管理者ID
	 */
	async findOrCreateAdminAccount(data: {
		email: string;
		name: string;
		role: "admin" | "staff";
	}): Promise<string> {
		// 既存の管理者アカウントを検索
		const existingAdmin = await this.findAdminByEmail(data.email);

		if (existingAdmin) {
			return existingAdmin.adminId;
		}

		// 新規管理者アカウントを作成
		const adminId = uuidv4();
		const now = new Date().toISOString();

		await this.db
			.insert(adminAccounts)
			.values({
				adminId,
				email: data.email,
				name: data.name,
				role: data.role,
				isActive: 1,
				createdAt: now,
				updatedAt: now,
			})
			.execute();

		return adminId;
	}

	/**
	 * 管理者とジムの関連付けを作成する
	 * @param data 関連付け情報
	 * @returns 作成成功の真偽値
	 */
	async createGymRelationship(data: {
		adminId: string;
		gymId: string;
		role: "owner" | "manager" | "staff";
	}): Promise<boolean> {
		// 既存の関連を確認
		const existingRelationship = await this.getGymRelationship(data.adminId, data.gymId);

		// 既に存在している場合は更新に切り替える
		if (existingRelationship) {
			const result = await this.db
				.update(adminGymRelationships)
				.set({
					role: data.role,
				})
				.where(
					and(
						eq(adminGymRelationships.adminId, data.adminId),
						eq(adminGymRelationships.gymId, data.gymId),
					),
				)
				.execute();

			return result.changes > 0;
		}

		// 新規に関連付けを作成
		const now = new Date().toISOString();

		const result = await this.db
			.insert(adminGymRelationships)
			.values({
				adminId: data.adminId,
				gymId: data.gymId,
				role: data.role,
				createdAt: now,
			})
			.execute();

		return result.changes > 0;
	}

	/**
	 * 管理者とジムの関連付けを取得する
	 * @param adminId 管理者ID
	 * @param gymId ジムID
	 * @returns 関連付け情報、存在しない場合はundefined
	 */
	async getGymRelationship(adminId: string, gymId: string) {
		const result = await this.db
			.select({
				adminId: adminGymRelationships.adminId,
				gymId: adminGymRelationships.gymId,
				role: adminGymRelationships.role,
			})
			.from(adminGymRelationships)
			.where(
				and(eq(adminGymRelationships.adminId, adminId), eq(adminGymRelationships.gymId, gymId)),
			)
			.execute();

		return result[0];
	}
}

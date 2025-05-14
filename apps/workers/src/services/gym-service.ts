import { IGymRepository } from "../repositories/gym-repository";
import { v4 as uuidv4 } from "uuid";
import type { Gym } from "../db";

/**
 * ジムサービスのインターフェース
 */
export interface IGymService {
  getGyms(options: {
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
  getGymById(gymId: string): Promise<Gym>;
  createGym(data: { name: string; ownerEmail: string }): Promise<Gym>;
  updateGym(
    gymId: string,
    data: Partial<{ name: string; ownerEmail: string }>
  ): Promise<Gym>;
  deleteGym(gymId: string): Promise<void>;
}

/**
 * ジムサービス - ジム関連のビジネスロジックを担当
 */
export class GymService implements IGymService {
	private repository: IGymRepository;

	constructor(repository: IGymRepository) {
		this.repository = repository;
	}

	/**
	 * ジム一覧を取得する
	 * @param options 取得オプション
	 * @returns ジム一覧とページネーション情報
	 */
	async getGyms(options: {
		page?: number;
		limit?: number;
		sort?: string;
		search?: string;
	}) {
		return this.repository.findAll(options);
	}

	/**
	 * 特定のジムをIDで取得する
	 * @param gymId ジムID
	 * @returns ジム情報
	 * @throws ジムが存在しない場合はエラー
	 */
	async getGymById(gymId: string) {
		const gym = await this.repository.findById(gymId);
		
		if (!gym) {
			throw new Error(`Gym with ID ${gymId} not found`);
		}
		
		return gym;
	}

	/**
	 * 新しいジムを作成する
	 * @param data ジム情報
	 * @returns 作成されたジム情報
	 */
	async createGym(data: { name: string; ownerEmail: string }) {
		const gymId = uuidv4();
		
		const gym = await this.repository.create({
			gymId,
			name: data.name,
			ownerEmail: data.ownerEmail,
		});
		
		if (!gym) {
			throw new Error("Failed to create gym");
		}
		
		return gym;
	}

	/**
	 * ジム情報を更新する
	 * @param gymId ジムID
	 * @param data 更新データ
	 * @returns 更新後のジム情報
	 * @throws ジムが存在しない場合はエラー
	 */
	async updateGym(
		gymId: string,
		data: Partial<{ name: string; ownerEmail: string }>
	) {
		// 更新前にジムの存在確認
		await this.getGymById(gymId);
		
		const updatedGym = await this.repository.update(gymId, data);
		
		if (!updatedGym) {
			throw new Error(`Failed to update gym with ID ${gymId}`);
		}
		
		return updatedGym;
	}

	/**
	 * ジムを削除する
	 * @param gymId ジムID
	 * @throws ジムが存在しない場合やエラーが発生した場合はエラー
	 */
	async deleteGym(gymId: string) {
		// 削除前にジムの存在確認
		await this.getGymById(gymId);
		
		const success = await this.repository.delete(gymId);
		
		if (!success) {
			throw new Error(`Failed to delete gym with ID ${gymId}`);
		}
	}
}
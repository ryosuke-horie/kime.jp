import type { ApiClient } from "../client";

export interface CreateGymAccountRequest {
	name: string;
	phoneNumber: string;
	ownerEmail: string;
	ownerName: string;
	password: string;
}

export interface CreateGymAccountResponse {
	message: string;
	gymId: string;
	ownerId: string;
}

/**
 * ジムアカウント関連のAPI機能を提供するクラス
 */
export class GymApiClient {
	private apiClient: ApiClient;

	constructor(apiClient: ApiClient) {
		this.apiClient = apiClient;
	}

	/**
	 * 新規ジムアカウントを作成する
	 * @param data ジムアカウント作成に必要な情報
	 * @returns 作成結果
	 */
	async createGymAccount(data: CreateGymAccountRequest): Promise<CreateGymAccountResponse> {
		return this.apiClient.post<CreateGymAccountResponse>("/api/gyms/create", data);
	}
}

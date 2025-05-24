import { v4 as uuidv4 } from "uuid";
import type { Staff } from "../db";
import type { IStaffRepository } from "../repositories/staff-repository";
import { AppError, BadRequestError, NotFoundError, ServerError } from "../utils/errors";
import { comparePassword, hashPassword } from "../utils/password";

/**
 * APIレスポンス用のスタッフ型定義
 */
export interface StaffResponse {
	id: string;
	email: string;
	name: string;
	role: "owner" | "staff";
	isActive: boolean;
	createdAt: string;
	lastLoginAt?: string;
}

/**
 * スタッフサービスのインターフェース
 */
export interface IStaffService {
	getStaffByGymId(gymId: string): Promise<StaffResponse[]>;
	createStaff(data: {
		gymId: string;
		email: string;
		name: string;
		role: "staff";
		temporaryPassword?: string;
	}): Promise<{
		success: true;
		staff: {
			id: string;
			email: string;
			name: string;
			role: "staff";
			temporaryPassword: string;
		};
	}>;
	updateStaff(
		staffId: string,
		data: Partial<{
			name: string;
			email: string;
			isActive: boolean;
		}>,
	): Promise<StaffResponse>;
	deleteStaff(staffId: string): Promise<void>;
	changePassword(
		staffId: string,
		data: {
			newPassword: string;
			currentPassword?: string;
		},
		isOwnerRequest?: boolean,
	): Promise<void>;
	generateTemporaryPassword(): string;
}

/**
 * スタッフサービスの実装
 */
export class StaffService implements IStaffService {
	constructor(private staffRepository: IStaffRepository) {}

	/**
	 * データベースのStaff型をAPIレスポンス型に変換
	 */
	private mapToStaffResponse(staff: Staff): StaffResponse {
		return {
			id: staff.staffId,
			email: staff.email,
			name: staff.name,
			role: staff.role === "admin" ? "owner" : "staff", // DBスキーマ（admin/reception）をAPIレベル（owner/staff）にマッピング
			isActive: staff.active === 1,
			createdAt: staff.createdAt || "",
			lastLoginAt: staff.lastLoginAt || undefined,
		};
	}

	/**
	 * 指定されたジムのスタッフ一覧を取得
	 * @param gymId ジムID
	 * @returns スタッフ一覧
	 */
	async getStaffByGymId(gymId: string): Promise<StaffResponse[]> {
		try {
			const staffList = await this.staffRepository.findByGymId(gymId);
			return staffList.map((staff) => this.mapToStaffResponse(staff));
		} catch (error) {
			throw new ServerError("スタッフ一覧の取得に失敗しました", { error });
		}
	}

	/**
	 * 新しいスタッフを作成
	 * @param data スタッフ作成データ
	 * @returns 作成されたスタッフ情報
	 */
	async createStaff(data: {
		gymId: string;
		email: string;
		name: string;
		role: "staff";
		temporaryPassword?: string;
	}): Promise<{
		success: true;
		staff: {
			id: string;
			email: string;
			name: string;
			role: "staff";
			temporaryPassword: string;
		};
	}> {
		try {
			// メールアドレスの重複チェック
			const existingStaff = await this.staffRepository.findByEmail(data.email, data.gymId);
			if (existingStaff) {
				throw new BadRequestError("このメールアドレスは既に使用されています");
			}

			// バリデーション
			if (!data.email || !data.name) {
				throw new BadRequestError("メールアドレスと名前は必須です");
			}

			if (!this.isValidEmail(data.email)) {
				throw new BadRequestError("有効なメールアドレスを入力してください");
			}

			// 一時パスワードを生成または使用
			const temporaryPassword = data.temporaryPassword || this.generateTemporaryPassword();

			// パスワードをハッシュ化
			const passwordHash = await hashPassword(temporaryPassword);

			// スタッフIDを生成
			const staffId = `staff-${uuidv4()}`;

			// スタッフを作成
			const createdStaff = await this.staffRepository.create({
				staffId,
				gymId: data.gymId,
				name: data.name,
				email: data.email,
				role: "reception", // データベースでは "reception" を使用（APIレベルでは "staff" として扱う）
				passwordHash,
				active: true,
			});

			if (!createdStaff) {
				throw new ServerError("スタッフの作成に失敗しました");
			}

			return {
				success: true,
				staff: {
					id: createdStaff.staffId,
					email: createdStaff.email,
					name: createdStaff.name,
					role: "staff",
					temporaryPassword,
				},
			};
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			throw new ServerError("スタッフの作成に失敗しました", { error });
		}
	}

	/**
	 * スタッフ情報を更新
	 * @param staffId スタッフID
	 * @param data 更新データ
	 * @returns 更新されたスタッフ情報
	 */
	async updateStaff(
		staffId: string,
		data: Partial<{
			name: string;
			email: string;
			isActive: boolean;
		}>,
	): Promise<StaffResponse> {
		try {
			// 存在確認
			const existingStaff = await this.staffRepository.findById(staffId);
			if (!existingStaff) {
				throw new NotFoundError("スタッフが見つかりません");
			}

			// バリデーション
			if (data.email && !this.isValidEmail(data.email)) {
				throw new BadRequestError("有効なメールアドレスを入力してください");
			}

			// メールアドレスの重複チェック（自分以外）
			if (data.email && data.email !== existingStaff.email) {
				const duplicateStaff = await this.staffRepository.findByEmail(
					data.email,
					existingStaff.gymId,
				);
				if (duplicateStaff && duplicateStaff.staffId !== staffId) {
					throw new BadRequestError("このメールアドレスは既に使用されています");
				}
			}

			// 更新データを変換
			const updateData: any = {};
			if (data.name !== undefined) updateData.name = data.name;
			if (data.email !== undefined) updateData.email = data.email;
			if (data.isActive !== undefined) updateData.active = data.isActive;

			const updatedStaff = await this.staffRepository.update(staffId, updateData);
			if (!updatedStaff) {
				throw new ServerError("スタッフの更新に失敗しました");
			}

			return this.mapToStaffResponse(updatedStaff);
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			throw new ServerError("スタッフの更新に失敗しました", { error });
		}
	}

	/**
	 * スタッフを削除
	 * @param staffId スタッフID
	 */
	async deleteStaff(staffId: string): Promise<void> {
		try {
			// 存在確認
			const existingStaff = await this.staffRepository.findById(staffId);
			if (!existingStaff) {
				throw new NotFoundError("スタッフが見つかりません");
			}

			const success = await this.staffRepository.delete(staffId);
			if (!success) {
				throw new ServerError("スタッフの削除に失敗しました");
			}
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			throw new ServerError("スタッフの削除に失敗しました", { error });
		}
	}

	/**
	 * パスワードを変更
	 * @param staffId スタッフID
	 * @param data パスワード変更データ
	 * @param isOwnerRequest オーナーからのリクエストかどうか
	 */
	async changePassword(
		staffId: string,
		data: {
			newPassword: string;
			currentPassword?: string;
		},
		isOwnerRequest = false,
	): Promise<void> {
		try {
			// 存在確認
			const existingStaff = await this.staffRepository.findById(staffId);
			if (!existingStaff) {
				throw new NotFoundError("スタッフが見つかりません");
			}

			// 新しいパスワードのバリデーション
			if (!this.isValidPassword(data.newPassword)) {
				throw new BadRequestError("パスワードは8文字以上で、英数字を含む必要があります");
			}

			// オーナーからのリクエストでない場合、現在のパスワードを確認
			if (!isOwnerRequest) {
				if (!data.currentPassword) {
					throw new BadRequestError("現在のパスワードを入力してください");
				}

				const isCurrentPasswordValid = await comparePassword(
					data.currentPassword,
					existingStaff.passwordHash,
				);

				if (!isCurrentPasswordValid) {
					throw new BadRequestError("現在のパスワードが正しくありません");
				}
			}

			// 新しいパスワードをハッシュ化
			const newPasswordHash = await hashPassword(data.newPassword);

			// パスワードを更新
			const success = await this.staffRepository.updatePassword(staffId, newPasswordHash);
			if (!success) {
				throw new ServerError("パスワードの変更に失敗しました");
			}
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			throw new ServerError("パスワードの変更に失敗しました", { error });
		}
	}

	/**
	 * 一時パスワードを生成
	 * @returns 生成された一時パスワード
	 */
	generateTemporaryPassword(): string {
		// 英数字混合の8文字パスワードを生成
		const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
		let password = "";

		// 最低1つの大文字、1つの小文字、1つの数字を含むように
		const upperCase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
		const lowerCase = "abcdefghijkmnpqrstuvwxyz";
		const numbers = "23456789";

		// 暗号学的に安全な乱数生成を使用
		const randomInt = (max: number) => {
			const array = new Uint32Array(1);
			crypto.getRandomValues(array);
			return (array[0] ?? 0) % max;
		};

		password += upperCase[randomInt(upperCase.length)];
		password += lowerCase[randomInt(lowerCase.length)];
		password += numbers[randomInt(numbers.length)];

		// 残りの5文字をランダムに生成
		for (let i = 3; i < 8; i++) {
			password += chars[randomInt(chars.length)];
		}

		// 文字列をシャッフル（暗号学的に安全な方法）
		return password
			.split("")
			.sort(() => (randomInt(2) === 0 ? -1 : 1))
			.join("");
	}

	/**
	 * メールアドレスの形式を検証
	 */
	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	/**
	 * パスワードの強度を検証
	 */
	private isValidPassword(password: string): boolean {
		// 8文字以上、英数字を含む
		const hasMinLength = password.length >= 8;
		const hasLetter = /[a-zA-Z]/.test(password);
		const hasNumber = /\d/.test(password);

		return hasMinLength && hasLetter && hasNumber;
	}
}

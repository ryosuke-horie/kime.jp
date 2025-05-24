/**
 * スタッフ情報の型定義
 */
export interface StaffType {
	id: string;
	email: string;
	name: string;
	role: "owner" | "staff";
	isActive: boolean;
	createdAt: string;
	lastLoginAt?: string;
}

/**
 * スタッフ作成リクエストの型定義
 */
export interface StaffCreateRequest {
	email: string;
	name: string;
	role: "staff";
	temporaryPassword?: string;
}

/**
 * スタッフ作成レスポンスの型定義
 */
export interface StaffCreateResponse {
	success: true;
	staff: {
		id: string;
		email: string;
		name: string;
		role: "staff";
		temporaryPassword: string;
	};
}

/**
 * スタッフ更新リクエストの型定義
 */
export interface StaffUpdateRequest {
	email?: string;
	name?: string;
	isActive?: boolean;
}

/**
 * パスワード変更リクエストの型定義
 */
export interface PasswordChangeRequest {
	newPassword: string;
	currentPassword?: string;
}

/**
 * スタッフ一覧レスポンスの型定義
 */
export interface StaffListResponse {
	staff: StaffType[];
}

/**
 * スタッフのステータス表示用の型定義
 */
export type StaffStatus = "active" | "inactive";

/**
 * スタッフのロール表示用の型定義
 */
export type StaffRoleDisplay = "オーナー" | "スタッフ";

/**
 * 管理者アカウント情報の型定義
 */
export interface AdminInfo {
	adminId: string;
	email: string;
	name: string;
	role: "admin" | "staff";
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

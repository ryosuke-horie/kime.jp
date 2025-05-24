/// <reference path="../../../../worker-configuration.d.ts" />
/// <reference path="../../../types/cloudflare-test.d.ts" />
import { env } from "cloudflare:test";
import { beforeEach, describe, expect } from "vitest";
import app from "../../../index";
import { createTestRequest, isD1Available, itWithD1 } from "../../../test/helpers/test-utils";

// APIレスポンス型定義
interface StaffResponse {
	id: string;
	email: string;
	name: string;
	role: "owner" | "staff";
	isActive: boolean;
	createdAt: string;
	lastLoginAt?: string;
}

interface StaffListResponse {
	staff: StaffResponse[];
}

interface StaffCreateRequest {
	email: string;
	name: string;
	role: "staff";
	temporaryPassword: string;
}

interface StaffCreateResponse {
	success: true;
	staff: {
		id: string;
		email: string;
		name: string;
		role: "staff";
		temporaryPassword: string;
	};
}

interface StaffUpdateRequest {
	email?: string;
	name?: string;
	isActive?: boolean;
}

interface PasswordChangeRequest {
	newPassword: string;
	currentPassword?: string;
}

describe("スタッフ管理API - 統合テスト", () => {
	let ownerAuthToken: string;
	let staffAuthToken: string;

	beforeEach(async () => {
		if (!isD1Available()) return;

		// テストデータはapply-migrations.tsで自動的に挿入される
		// ここで認証トークンを取得する（実際の実装時に調整）
		ownerAuthToken = "test-owner-token";
		staffAuthToken = "test-staff-token";
	});

	describe("GET /api/staff", () => {
		itWithD1("オーナー権限でスタッフ一覧を取得できること", async () => {
			// リクエスト作成
			const req = createTestRequest("/api/staff", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${ownerAuthToken}`,
				},
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(200);

			const data = (await res.json()) as StaffListResponse;
			expect(data).toHaveProperty("staff");
			expect(Array.isArray(data.staff)).toBe(true);

			// データの形式を検証
			if (data.staff.length > 0) {
				const firstStaff = data.staff[0];
				if (firstStaff) {
					expect(firstStaff).toHaveProperty("id");
					expect(firstStaff).toHaveProperty("email");
					expect(firstStaff).toHaveProperty("name");
					expect(firstStaff).toHaveProperty("role");
					expect(firstStaff).toHaveProperty("isActive");
					expect(firstStaff).toHaveProperty("createdAt");
					expect(["owner", "staff"]).toContain(firstStaff.role);
					expect(typeof firstStaff.isActive).toBe("boolean");
				}
			}
		});

		itWithD1("スタッフ権限ではアクセス拒否されること", async () => {
			// リクエスト作成
			const req = createTestRequest("/api/staff", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${staffAuthToken}`,
				},
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証（権限エラー）
			expect(res.status).toBe(403);
		});

		itWithD1("認証トークンなしではアクセス拒否されること", async () => {
			// リクエスト作成（認証ヘッダーなし）
			const req = createTestRequest("/api/staff");

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証（認証エラー）
			expect(res.status).toBe(401);
		});
	});

	describe("POST /api/staff", () => {
		itWithD1("オーナー権限で新しいスタッフを作成できること", async () => {
			// テストデータ
			const staffData: StaffCreateRequest = {
				email: "new-staff@example.com",
				name: "新規スタッフ",
				role: "staff",
				temporaryPassword: "temp123456",
			};

			// リクエスト作成
			const req = createTestRequest("/api/staff", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ownerAuthToken}`,
				},
				body: staffData as unknown as Record<string, unknown>,
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(201);

			const data = (await res.json()) as StaffCreateResponse;
			expect(data.success).toBe(true);
			expect(data.staff).toHaveProperty("id");
			expect(data.staff.email).toBe(staffData.email);
			expect(data.staff.name).toBe(staffData.name);
			expect(data.staff.role).toBe("staff");
			expect(data.staff).toHaveProperty("temporaryPassword");
		});

		itWithD1("スタッフ権限では新規作成がアクセス拒否されること", async () => {
			// テストデータ
			const staffData: StaffCreateRequest = {
				email: "unauthorized@example.com",
				name: "無権限スタッフ",
				role: "staff",
				temporaryPassword: "temp123456",
			};

			// リクエスト作成
			const req = createTestRequest("/api/staff", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${staffAuthToken}`,
				},
				body: staffData as unknown as Record<string, unknown>,
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証（権限エラー）
			expect(res.status).toBe(403);
		});

		itWithD1("バリデーションエラーが発生した場合に400エラーを返すこと", async () => {
			// 不正なデータ（必須項目の欠如）
			const invalidData = {
				name: "名前のみ",
				// emailが不足
			};

			// リクエスト作成
			const req = createTestRequest("/api/staff", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ownerAuthToken}`,
				},
				body: invalidData as Record<string, unknown>,
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(400);

			const data = (await res.json()) as { error: string; details: unknown };
			expect(data).toHaveProperty("error");
			expect(data).toHaveProperty("details");
		});

		itWithD1("不正なメールアドレス形式の場合に400エラーを返すこと", async () => {
			// 不正なデータ（不正なメールアドレス）
			const invalidData = {
				email: "invalid-email",
				name: "テストスタッフ",
				role: "staff",
				temporaryPassword: "temp123456",
			};

			// リクエスト作成
			const req = createTestRequest("/api/staff", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ownerAuthToken}`,
				},
				body: invalidData as Record<string, unknown>,
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(400);
		});
	});

	describe("PUT /api/staff/:id", () => {
		itWithD1("オーナー権限でスタッフ情報を更新できること", async () => {
			// 更新データ
			const updateData: StaffUpdateRequest = {
				name: "更新されたスタッフ名",
				email: "updated-staff@example.com",
			};

			// リクエスト作成（テストスタッフID使用）
			const req = createTestRequest("/api/staff/staff-1", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ownerAuthToken}`,
				},
				body: updateData as Record<string, unknown>,
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(200);

			const data = (await res.json()) as { message: string };
			expect(data.message).toBe("スタッフ情報を更新しました");
		});

		itWithD1("スタッフが自分の情報を更新できること", async () => {
			// 更新データ（スタッフは自分の名前とメールのみ更新可能）
			const updateData = {
				name: "自分で更新した名前",
				email: "self-updated@example.com",
			};

			// リクエスト作成（自分のIDで更新）
			const req = createTestRequest("/api/staff/staff-1", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${staffAuthToken}`,
				},
				body: updateData as Record<string, unknown>,
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(200);
		});

		itWithD1("スタッフが他人の情報を更新しようとしてアクセス拒否されること", async () => {
			// 更新データ
			const updateData = {
				name: "他人の名前を変更",
			};

			// リクエスト作成（他のスタッフIDで更新）
			const req = createTestRequest("/api/staff/staff-2", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${staffAuthToken}`,
				},
				body: updateData as Record<string, unknown>,
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証（権限エラー）
			expect(res.status).toBe(403);
		});

		itWithD1("存在しないスタッフIDの場合に404エラーを返すこと", async () => {
			// 更新データ
			const updateData = {
				name: "存在しないスタッフ",
			};

			// リクエスト作成
			const req = createTestRequest("/api/staff/non-existent-id", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ownerAuthToken}`,
				},
				body: updateData as Record<string, unknown>,
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(404);
		});
	});

	describe("DELETE /api/staff/:id", () => {
		itWithD1("オーナー権限でスタッフを削除できること", async () => {
			// リクエスト作成
			const req = createTestRequest("/api/staff/staff-delete-test", {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${ownerAuthToken}`,
				},
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(200);

			const data = (await res.json()) as { message: string };
			expect(data.message).toBe("スタッフを削除しました");
		});

		itWithD1("スタッフ権限では削除がアクセス拒否されること", async () => {
			// リクエスト作成
			const req = createTestRequest("/api/staff/staff-1", {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${staffAuthToken}`,
				},
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証（権限エラー）
			expect(res.status).toBe(403);
		});

		itWithD1("存在しないスタッフIDの場合に404エラーを返すこと", async () => {
			// リクエスト作成
			const req = createTestRequest("/api/staff/non-existent-id", {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${ownerAuthToken}`,
				},
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(404);
		});
	});

	describe("PUT /api/staff/:id/password", () => {
		itWithD1("スタッフが自分のパスワードを変更できること", async () => {
			// パスワード変更データ
			const passwordData: PasswordChangeRequest = {
				newPassword: "newSecurePassword123",
				currentPassword: "currentPassword123",
			};

			// リクエスト作成
			const req = createTestRequest("/api/staff/staff-1/password", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${staffAuthToken}`,
				},
				body: passwordData as unknown as Record<string, unknown>,
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(200);

			const data = (await res.json()) as { message: string };
			expect(data.message).toBe("パスワードを変更しました");
		});

		itWithD1("オーナーがスタッフのパスワードをリセットできること", async () => {
			// パスワードリセットデータ（currentPasswordは不要）
			const passwordData = {
				newPassword: "ownerResetPassword123",
			};

			// リクエスト作成
			const req = createTestRequest("/api/staff/staff-1/password", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ownerAuthToken}`,
				},
				body: passwordData as unknown as Record<string, unknown>,
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(200);

			const data = (await res.json()) as { message: string };
			expect(data.message).toBe("パスワードを変更しました");
		});

		itWithD1("現在のパスワードが間違っている場合に400エラーを返すこと", async () => {
			// 間違ったパスワードデータ
			const passwordData = {
				newPassword: "newSecurePassword123",
				currentPassword: "wrongPassword",
			};

			// リクエスト作成
			const req = createTestRequest("/api/staff/staff-1/password", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${staffAuthToken}`,
				},
				body: passwordData as unknown as Record<string, unknown>,
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(400);

			const data = (await res.json()) as { error: string };
			expect(data.error).toBe("現在のパスワードが正しくありません");
		});

		itWithD1("弱いパスワードの場合に400エラーを返すこと", async () => {
			// 弱いパスワードデータ
			const passwordData = {
				newPassword: "123", // 短すぎるパスワード
				currentPassword: "currentPassword123",
			};

			// リクエスト作成
			const req = createTestRequest("/api/staff/staff-1/password", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${staffAuthToken}`,
				},
				body: passwordData as unknown as Record<string, unknown>,
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証
			expect(res.status).toBe(400);

			const data = (await res.json()) as { error: string; details: unknown };
			expect(data).toHaveProperty("error");
			expect(data).toHaveProperty("details");
		});

		itWithD1("他のスタッフのパスワード変更がアクセス拒否されること", async () => {
			// パスワード変更データ
			const passwordData = {
				newPassword: "newSecurePassword123",
				currentPassword: "currentPassword123",
			};

			// リクエスト作成（他のスタッフIDで変更）
			const req = createTestRequest("/api/staff/staff-2/password", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${staffAuthToken}`,
				},
				body: passwordData as unknown as Record<string, unknown>,
			});

			// リクエスト実行
			if (!env.DB) return;
			const res = await app.fetch(req, { DB: env.DB });

			// レスポンス検証（権限エラー）
			expect(res.status).toBe(403);
		});
	});
});

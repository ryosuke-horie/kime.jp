/// <reference path="../../worker-configuration.d.ts" />
import type { Context } from "hono";
import { z } from "zod";
import { StaffRepository } from "../repositories/staff-repository";
import { type IStaffService, StaffService } from "../services/staff-service";
import { BadRequestError, ForbiddenError, NotFoundError, ServerError } from "../utils/errors";

// Honoのコンテキスト型拡張
type AppContext = Context<{ Bindings: CloudflareBindings }>;

// スタッフ作成リクエストのバリデーションスキーマ
const createStaffSchema = z.object({
	email: z.string().email("有効なメールアドレスを入力してください"),
	name: z.string().min(1, "名前は必須です").max(100, "名前は100文字以内で入力してください"),
	role: z.literal("staff"),
	temporaryPassword: z.string().min(8, "パスワードは8文字以上で入力してください").optional(),
});

// スタッフ更新リクエストのバリデーションスキーマ
const updateStaffSchema = z.object({
	email: z.string().email("有効なメールアドレスを入力してください").optional(),
	name: z
		.string()
		.min(1, "名前は必須です")
		.max(100, "名前は100文字以内で入力してください")
		.optional(),
	isActive: z.boolean().optional(),
});

// パスワード変更リクエストのバリデーションスキーマ
const changePasswordSchema = z.object({
	newPassword: z.string().min(8, "パスワードは8文字以上で入力してください").max(100),
	currentPassword: z.string().optional(),
});

/**
 * スタッフコントローラー - リクエスト処理とレスポンス生成を担当
 */
export class StaffController {
	private staffService: IStaffService;

	constructor(d1: CloudflareBindings["DB"]) {
		const staffRepository = new StaffRepository(d1);
		this.staffService = new StaffService(staffRepository);
	}

	/**
	 * スタッフ一覧を取得する
	 * GET /api/staff (オーナーのみ)
	 */
	async getStaffList(c: AppContext) {
		try {
			const auth = c.get("auth");
			if (!auth) {
				return c.json({ error: "認証が必要です" }, 401);
			}

			// オーナー権限チェック
			if (auth.role !== "owner") {
				return c.json({ error: "この操作にはオーナー権限が必要です" }, 403);
			}

			const staff = await this.staffService.getStaffByGymId(auth.gymId);
			return c.json({ staff });
		} catch (error) {
			console.error("Error getting staff list:", error);

			if (error instanceof BadRequestError) {
				return c.json({ error: error.message, details: error.details }, 400);
			}
			if (error instanceof ForbiddenError) {
				return c.json({ error: error.message }, 403);
			}
			if (error instanceof NotFoundError) {
				return c.json({ error: error.message }, 404);
			}
			if (error instanceof ServerError) {
				return c.json({ error: error.message }, 500);
			}

			return c.json({ error: "スタッフ一覧の取得に失敗しました" }, 500);
		}
	}

	/**
	 * 新しいスタッフを作成する
	 * POST /api/staff (オーナーのみ)
	 */
	async createStaff(c: AppContext) {
		try {
			const auth = c.get("auth");
			if (!auth) {
				return c.json({ error: "認証が必要です" }, 401);
			}

			// オーナー権限チェック
			if (auth.role !== "owner") {
				return c.json({ error: "この操作にはオーナー権限が必要です" }, 403);
			}

			// リクエストボディの取得とバリデーション
			const body = await c.req.json();
			const validatedData = createStaffSchema.parse(body);

			const result = await this.staffService.createStaff({
				gymId: auth.gymId,
				...validatedData,
			});

			return c.json(result, 201);
		} catch (error) {
			console.error("Error creating staff:", error);

			// Zodバリデーションエラー
			if (error instanceof z.ZodError) {
				return c.json(
					{
						error: "入力データが無効です",
						details: error.errors,
					},
					400,
				);
			}

			if (error instanceof BadRequestError) {
				return c.json({ error: error.message, details: error.details }, 400);
			}
			if (error instanceof ForbiddenError) {
				return c.json({ error: error.message }, 403);
			}
			if (error instanceof NotFoundError) {
				return c.json({ error: error.message }, 404);
			}
			if (error instanceof ServerError) {
				return c.json({ error: error.message }, 500);
			}

			return c.json({ error: "スタッフの作成に失敗しました" }, 500);
		}
	}

	/**
	 * スタッフ情報を更新する
	 * PUT /api/staff/:id (オーナー または 自分のスタッフ)
	 */
	async updateStaff(c: AppContext) {
		try {
			const auth = c.get("auth");
			if (!auth) {
				return c.json({ error: "認証が必要です" }, 401);
			}

			const staffId = c.req.param("id");
			if (!staffId) {
				return c.json({ error: "スタッフIDが必要です" }, 400);
			}

			// 権限チェック: オーナー または 自分のスタッフIDの場合のみ許可
			if (auth.role !== "owner" && auth.userId !== staffId) {
				return c.json({ error: "他のスタッフの情報は変更できません" }, 403);
			}

			// リクエストボディの取得とバリデーション
			const body = await c.req.json();
			const validatedData = updateStaffSchema.parse(body);

			// スタッフが自分の情報を更新する場合、isActiveは変更不可
			if (auth.role !== "owner" && validatedData.isActive !== undefined) {
				return c.json({ error: "アクティブ状態はオーナーのみ変更できます" }, 403);
			}

			const updatedStaff = await this.staffService.updateStaff(staffId, validatedData);
			return c.json({
				message: "スタッフ情報を更新しました",
				staff: updatedStaff,
			});
		} catch (error) {
			console.error("Error updating staff:", error);

			// Zodバリデーションエラー
			if (error instanceof z.ZodError) {
				return c.json(
					{
						error: "入力データが無効です",
						details: error.errors,
					},
					400,
				);
			}

			if (error instanceof BadRequestError) {
				return c.json({ error: error.message, details: error.details }, 400);
			}
			if (error instanceof ForbiddenError) {
				return c.json({ error: error.message }, 403);
			}
			if (error instanceof NotFoundError) {
				return c.json({ error: error.message }, 404);
			}
			if (error instanceof ServerError) {
				return c.json({ error: error.message }, 500);
			}

			return c.json({ error: "スタッフ情報の更新に失敗しました" }, 500);
		}
	}

	/**
	 * スタッフを削除する
	 * DELETE /api/staff/:id (オーナーのみ)
	 */
	async deleteStaff(c: AppContext) {
		try {
			const auth = c.get("auth");
			if (!auth) {
				return c.json({ error: "認証が必要です" }, 401);
			}

			// オーナー権限チェック
			if (auth.role !== "owner") {
				return c.json({ error: "この操作にはオーナー権限が必要です" }, 403);
			}

			const staffId = c.req.param("id");
			if (!staffId) {
				return c.json({ error: "スタッフIDが必要です" }, 400);
			}

			// 自分自身の削除を防ぐ
			if (auth.userId === staffId) {
				return c.json({ error: "自分自身は削除できません" }, 400);
			}

			await this.staffService.deleteStaff(staffId);
			return c.json({ message: "スタッフを削除しました" });
		} catch (error) {
			console.error("Error deleting staff:", error);

			if (error instanceof BadRequestError) {
				return c.json({ error: error.message, details: error.details }, 400);
			}
			if (error instanceof ForbiddenError) {
				return c.json({ error: error.message }, 403);
			}
			if (error instanceof NotFoundError) {
				return c.json({ error: error.message }, 404);
			}
			if (error instanceof ServerError) {
				return c.json({ error: error.message }, 500);
			}

			return c.json({ error: "スタッフの削除に失敗しました" }, 500);
		}
	}

	/**
	 * パスワードを変更する
	 * PUT /api/staff/:id/password (オーナー または 自分のスタッフ)
	 */
	async changePassword(c: AppContext) {
		try {
			const auth = c.get("auth");
			if (!auth) {
				return c.json({ error: "認証が必要です" }, 401);
			}

			const staffId = c.req.param("id");
			if (!staffId) {
				return c.json({ error: "スタッフIDが必要です" }, 400);
			}

			// 権限チェック: オーナー または 自分のスタッフIDの場合のみ許可
			if (auth.role !== "owner" && auth.userId !== staffId) {
				return c.json({ error: "他のスタッフのパスワードは変更できません" }, 403);
			}

			// リクエストボディの取得とバリデーション
			const body = await c.req.json();
			const validatedData = changePasswordSchema.parse(body);

			// オーナーからのリクエストの場合、currentPasswordは不要
			const isOwnerRequest = auth.role === "owner" && auth.userId !== staffId;

			await this.staffService.changePassword(staffId, validatedData, isOwnerRequest);

			return c.json({ message: "パスワードを変更しました" });
		} catch (error) {
			console.error("Error changing password:", error);

			// Zodバリデーションエラー
			if (error instanceof z.ZodError) {
				return c.json(
					{
						error: "入力データが無効です",
						details: error.errors,
					},
					400,
				);
			}

			if (error instanceof BadRequestError) {
				return c.json({ error: error.message, details: error.details }, 400);
			}
			if (error instanceof ForbiddenError) {
				return c.json({ error: error.message }, 403);
			}
			if (error instanceof NotFoundError) {
				return c.json({ error: error.message }, 404);
			}
			if (error instanceof ServerError) {
				return c.json({ error: error.message }, 500);
			}

			return c.json({ error: "パスワードの変更に失敗しました" }, 500);
		}
	}
}

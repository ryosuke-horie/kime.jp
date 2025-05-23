/// <reference path="../../worker-configuration.d.ts" />
import type { Context } from "hono";
import { z } from "zod";
import { AdminRepository } from "../repositories/admin-repository";
import { GymRepository } from "../repositories/gym-repository";
import { GymService, type IGymService } from "../services/gym-service";
import { BadRequestError, NotFoundError, ServerError } from "../utils/errors";

// Honoのコンテキスト型拡張
type AppContext = Context<{ Bindings: CloudflareBindings }>;

// クエリパラメータのバリデーションスキーマ
const gymListQuerySchema = z.object({
	page: z
		.string()
		.optional()
		.transform((val) => (val ? Number.parseInt(val, 10) : 1)),
	limit: z
		.string()
		.optional()
		.transform((val) => {
			const limit = val ? Number.parseInt(val, 10) : 10;
			// 1~100の範囲に制限
			return Math.max(1, Math.min(100, limit));
		}),
	sort: z
		.string()
		.optional()
		.transform((val) => {
			// 許可されたソート値のみ受け付ける
			const allowedValues = ["name", "createdAt", "-name", "-createdAt"];
			// undefinedの場合もデフォルト値を返す
			return val && allowedValues.includes(val) ? val : "-createdAt";
		}),
	search: z.string().optional(),
});

// ジム作成リクエストのバリデーションスキーマ
const createGymSchema = z.object({
	name: z.string().min(1).max(100),
	ownerEmail: z.string().email(),
	password: z.string().min(8).max(100),
});

// ジム更新リクエストのバリデーションスキーマ（PATCH: 部分更新）
const updateGymSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	ownerEmail: z.string().email().optional(),
	password: z.string().min(8).max(100).optional(),
});

// ジム完全更新リクエストのバリデーションスキーマ（PUT: 完全更新）
const updateGymFullSchema = z.object({
	name: z.string().min(1).max(100),
	ownerEmail: z.string().email(),
	password: z.string().min(8).max(100).optional(),
});

/**
 * ジムコントローラー - リクエスト処理とレスポンス生成を担当
 */
export class GymController {
	private gymService: IGymService;

	constructor(d1: CloudflareBindings["DB"]) {
		const gymRepository = new GymRepository(d1);
		const adminRepository = new AdminRepository(d1);
		this.gymService = new GymService(gymRepository, adminRepository);
	}

	/**
	 * ジム一覧を取得する
	 */
	async getGyms(c: AppContext) {
		// クエリパラメータをバリデーション
		const parseResult = gymListQuerySchema.safeParse(
			Object.fromEntries(new URL(c.req.url).searchParams.entries()),
		);

		if (!parseResult.success) {
			throw new BadRequestError("無効なクエリパラメータです", parseResult.error.format());
		}

		const { page, limit, sort, search } = parseResult.data;

		const result = await this.gymService.getGyms({ page, limit, sort, search });

		return c.json({
			gyms: result.items,
			meta: result.meta,
		});
	}

	/**
	 * 特定のジムをIDで取得する
	 */
	async getGymById(c: AppContext) {
		const gymId = c.req.param("gymId");

		try {
			const gym = await this.gymService.getGymById(gymId);
			return c.json({ gym });
		} catch (error) {
			// NotFoundエラーの場合は404レスポンスを直接返す
			if (error instanceof Error && error.message.includes("not found")) {
				return c.json({ error: `ジムID ${gymId} が見つかりません` }, { status: 404 });
			}
			// その他のエラーは再スロー
			throw new ServerError("ジム情報の取得に失敗しました");
		}
	}

	/**
	 * 新しいジムを作成する
	 */
	async createGym(c: AppContext) {
		const data = await c.req.json();

		// 入力バリデーション
		const parseResult = createGymSchema.safeParse(data);

		if (!parseResult.success) {
			return c.json(
				{ error: "リクエストデータが不正です", details: parseResult.error.format() },
				{ status: 400 },
			);
		}

		const { name, ownerEmail, password } = parseResult.data;

		try {
			const gym = await this.gymService.createGym({ name, ownerEmail, password });
			return c.json({ message: "ジムを作成しました", gymId: gym.gymId }, { status: 201 });
		} catch (error) {
			throw new ServerError("ジムの作成に失敗しました");
		}
	}

	/**
	 * ジム情報を部分的に更新する（PATCH）
	 */
	async updateGym(c: AppContext) {
		const gymId = c.req.param("gymId");
		const data = await c.req.json();

		// 入力バリデーション
		const parseResult = updateGymSchema.safeParse(data);

		if (!parseResult.success) {
			return c.json(
				{ error: "リクエストデータが不正です", details: parseResult.error.format() },
				{ status: 400 },
			);
		}

		const validData = parseResult.data;

		try {
			await this.gymService.updateGym(gymId, validData);
			return c.json({ message: "ジム情報を更新しました" });
		} catch (error) {
			if (error instanceof Error && error.message.includes("not found")) {
				return c.json({ error: `ジムID ${gymId} が見つかりません` }, { status: 404 });
			}
			throw new ServerError("ジム情報の更新に失敗しました");
		}
	}

	/**
	 * ジム情報を完全に更新する（PUT）
	 */
	async updateGymFull(c: AppContext) {
		const gymId = c.req.param("gymId");
		const data = await c.req.json();

		// 入力バリデーション
		const parseResult = updateGymFullSchema.safeParse(data);

		if (!parseResult.success) {
			return c.json(
				{ error: "リクエストデータが不正です", details: parseResult.error.format() },
				{ status: 400 },
			);
		}

		const validData = parseResult.data;

		try {
			await this.gymService.updateGym(gymId, validData);
			return c.json({ message: "ジム情報を更新しました" });
		} catch (error) {
			if (error instanceof Error && error.message.includes("not found")) {
				return c.json({ error: `ジムID ${gymId} が見つかりません` }, { status: 404 });
			}
			throw new ServerError("ジム情報の更新に失敗しました");
		}
	}

	/**
	 * ジムを削除する
	 */
	async deleteGym(c: AppContext) {
		const gymId = c.req.param("gymId");

		try {
			await this.gymService.deleteGym(gymId);
			return c.json({ message: "Gym deleted successfully" });
		} catch (error) {
			if (error instanceof Error && error.message.includes("not found")) {
				return c.json({ error: `ジムID ${gymId} が見つかりません` }, { status: 404 });
			}
			throw new ServerError("ジムの削除に失敗しました");
		}
	}
}

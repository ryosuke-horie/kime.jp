import { Context } from "hono";
import { GymService, IGymService } from "../services/gym-service";
import { GymRepository } from "../repositories/gym-repository";
import { z } from "zod";

// クエリパラメータのバリデーションスキーマ
const gymListQuerySchema = z.object({
	page: z
		.string()
		.optional()
		.transform((val) => (val ? parseInt(val, 10) : 1)),
	limit: z
		.string()
		.optional()
		.transform((val) => {
			const limit = val ? parseInt(val, 10) : 10;
			// 1~100の範囲に制限
			return Math.max(1, Math.min(100, limit));
		}),
	sort: z
		.string()
		.optional()
		.transform((val) => {
			// 許可されたソート値のみ受け付ける
			const allowedValues = ["name", "createdAt", "-name", "-createdAt"];
			return allowedValues.includes(val) ? val : "-createdAt";
		}),
	search: z.string().optional(),
});

// ジム作成リクエストのバリデーションスキーマ
const createGymSchema = z.object({
	name: z.string().min(1).max(100),
	ownerEmail: z.string().email(),
});

// ジム更新リクエストのバリデーションスキーマ
const updateGymSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	ownerEmail: z.string().email().optional(),
});

/**
 * ジムコントローラー - リクエスト処理とレスポンス生成を担当
 */
export class GymController {
	private gymService: IGymService;

	constructor(d1: D1Database) {
		const gymRepository = new GymRepository(d1);
		this.gymService = new GymService(gymRepository);
	}

	/**
	 * ジム一覧を取得する
	 */
	async getGyms(c: Context) {
		try {
			// クエリパラメータをバリデーション
			const parseResult = gymListQuerySchema.safeParse(Object.fromEntries(
				new URL(c.req.url).searchParams.entries()
			));
			
			if (!parseResult.success) {
				return c.json(
					{ error: "Invalid query parameters", details: parseResult.error.format() },
					{ status: 400 }
				);
			}
			
			const { page, limit, sort, search } = parseResult.data;
			
			const result = await this.gymService.getGyms({ page, limit, sort, search });
			
			return c.json({
				gyms: result.items,
				meta: result.meta
			});
		} catch (error) {
			console.error("Error in getGyms:", error);
			return c.json(
				{ error: "Failed to fetch gyms" },
				{ status: 500 }
			);
		}
	}

	/**
	 * 特定のジムをIDで取得する
	 */
	async getGymById(c: Context) {
		try {
			const gymId = c.req.param("gymId");
			
			const gym = await this.gymService.getGymById(gymId);
			
			return c.json({ gym });
		} catch (error) {
			console.error("Error in getGymById:", error);
			
			if (error instanceof Error && error.message.includes("not found")) {
				return c.json(
					{ error: error.message },
					{ status: 404 }
				);
			}
			
			return c.json(
				{ error: "Failed to fetch gym" },
				{ status: 500 }
			);
		}
	}

	/**
	 * 新しいジムを作成する
	 */
	async createGym(c: Context) {
		try {
			const data = await c.req.json();
			
			// 入力バリデーション
			const parseResult = createGymSchema.safeParse(data);
			
			if (!parseResult.success) {
				return c.json(
					{ error: "Invalid request data", details: parseResult.error.format() },
					{ status: 400 }
				);
			}
			
			const { name, ownerEmail } = parseResult.data;
			
			const gym = await this.gymService.createGym({ name, ownerEmail });
			
			return c.json(
				{ message: "Gym created successfully", gymId: gym.gymId },
				{ status: 201 }
			);
		} catch (error) {
			console.error("Error in createGym:", error);
			return c.json(
				{ error: "Failed to create gym" },
				{ status: 500 }
			);
		}
	}

	/**
	 * ジム情報を更新する
	 */
	async updateGym(c: Context) {
		try {
			const gymId = c.req.param("gymId");
			const data = await c.req.json();
			
			// 入力バリデーション
			const parseResult = updateGymSchema.safeParse(data);
			
			if (!parseResult.success) {
				return c.json(
					{ error: "Invalid request data", details: parseResult.error.format() },
					{ status: 400 }
				);
			}
			
			const validData = parseResult.data;
			
			await this.gymService.updateGym(gymId, validData);
			
			return c.json({ message: "Gym updated successfully" });
		} catch (error) {
			console.error("Error in updateGym:", error);
			
			if (error instanceof Error && error.message.includes("not found")) {
				return c.json(
					{ error: error.message },
					{ status: 404 }
				);
			}
			
			return c.json(
				{ error: "Failed to update gym" },
				{ status: 500 }
			);
		}
	}

	/**
	 * ジムを削除する
	 */
	async deleteGym(c: Context) {
		try {
			const gymId = c.req.param("gymId");
			
			await this.gymService.deleteGym(gymId);
			
			return c.json({ message: "Gym deleted successfully" });
		} catch (error) {
			console.error("Error in deleteGym:", error);
			
			if (error instanceof Error && error.message.includes("not found")) {
				return c.json(
					{ error: error.message },
					{ status: 404 }
				);
			}
			
			return c.json(
				{ error: "Failed to delete gym" },
				{ status: 500 }
			);
		}
	}
}
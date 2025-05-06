import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../../../env";
import { getDatabaseClient } from "../../../lib/clients";
import { adminOnlyMiddleware } from "../../../middlewares/auth";
import {
	CreateGymRequest,
	GymDetailResponse,
	GymListResponse,
	UpdateGymRequest,
} from "../../../schemas";
import { validateBody, validateParam, validatedJson } from "../../../utils/validator";

// Gymルーター
export const gymRouter = new Hono<{ Bindings: Env }>();

// 開発用テストエンドポイントは削除

// 管理者用ルート
const adminRouter = new Hono<{ Bindings: Env }>().use("*", adminOnlyMiddleware());

// クエリパラメータのスキーマ
const GymListQuerySchema = z.object({
	page: z.coerce.number().int().min(1).optional().default(1),
	limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// ジム一覧取得（管理者用）
adminRouter.get("/", validateParam(GymListQuerySchema), async (c) => {
	const { page, limit } = c.req.valid("query");

	const dbClient = getDatabaseClient(c.env);
	const result = await dbClient.list("gyms");

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	// ページネーション情報を追加（今回は簡易実装）
	const meta = {
		total: result.data.length,
		page,
		limit,
		totalPages: Math.ceil(result.data.length / limit),
	};

	return validatedJson(c, GymListResponse, {
		gyms: result.data,
		meta,
	});
});

// ジム登録（管理者用）
adminRouter.post("/", validateBody(CreateGymRequest), async (c) => {
	const data = c.req.valid("json");

	const dbClient = getDatabaseClient(c.env);
	const result = await dbClient.create("gyms", {
		...data,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	});

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return validatedJson(
		c,
		z.object({
			message: z.string(),
			gymId: z.string().uuid(),
		}),
		{
			message: "ジムが登録されました",
			gymId: result.id,
		},
		201,
	);
});

// パスパラメータのスキーマ
const GymIdParamSchema = z.object({
	gymId: z.string().uuid(),
});

// ジム詳細取得
gymRouter.get("/:gymId", validateParam(GymIdParamSchema), async (c) => {
	const { gymId } = c.req.valid("param");

	const dbClient = getDatabaseClient(c.env);
	const result = await dbClient.getOne("gyms", gymId);

	if (!result.success) {
		return c.json({ error: "ジムが見つかりません" }, 404);
	}

	return validatedJson(c, GymDetailResponse, { gym: result.data });
});

// ジム情報更新（管理者用）
adminRouter.patch(
	"/:gymId",
	validateParam(GymIdParamSchema),
	validateBody(UpdateGymRequest),
	async (c) => {
		const { gymId } = c.req.valid("param");
		const data = c.req.valid("json");

		const dbClient = getDatabaseClient(c.env);

		// 更新前に存在確認
		const checkResult = await dbClient.getOne("gyms", gymId);
		if (!checkResult.success) {
			return c.json({ error: "ジムが見つかりません" }, 404);
		}

		// 更新処理
		const updateData = {
			...data,
			updatedAt: new Date().toISOString(),
		};

		const result = await dbClient.update("gyms", gymId, updateData);

		if (!result.success) {
			return c.json({ error: result.error }, 500);
		}

		return validatedJson(
			c,
			z.object({
				message: z.string(),
			}),
			{
				message: "ジム情報が更新されました",
			},
		);
	},
);

// ジム削除（管理者用）
adminRouter.delete("/:gymId", validateParam(GymIdParamSchema), async (c) => {
	const { gymId } = c.req.valid("param");

	const dbClient = getDatabaseClient(c.env);

	// 削除前に存在確認
	const checkResult = await dbClient.getOne("gyms", gymId);
	if (!checkResult.success) {
		return c.json({ error: "ジムが見つかりません" }, 404);
	}

	// 削除処理
	const result = await dbClient.delete("gyms", gymId);

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return validatedJson(
		c,
		z.object({
			message: z.string(),
		}),
		{
			message: "ジムが削除されました",
		},
	);
});

// 管理者用ルートをメインルーターにマウント
gymRouter.route("/admin", adminRouter);

export default gymRouter;

import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../../../env";
import { generateUUID } from "../../../lib/db-client";
import { getDatabaseClient } from "../../../lib/do-client";
import { adminOnlyMiddleware } from "../../../middlewares/auth";
import {
	CreateGymAccountRequest,
	CreateGymAccountResponse,
	CreateGymRequest,
	GymDetailResponse,
	GymListResponse,
	UpdateGymRequest,
} from "../../../schemas";
import { hashPassword } from "../../../utils/jwt";
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

// ジムアカウント発行 - /api/gyms/create
adminRouter.post("/create", validateBody(CreateGymAccountRequest), async (c) => {
	const data = c.req.valid("json");
	const dbClient = getDatabaseClient(c.env);

	// 1. メールアドレスの重複確認（管理者アカウント）
	const adminCheckResult = await dbClient.queryOne("admin_accounts", { email: data.ownerEmail });
	if (adminCheckResult.success && adminCheckResult.data) {
		return c.json({ error: "指定されたメールアドレスは既に使用されています" }, 400);
	}

	// トランザクション相当の処理を行うため順番に処理する
	try {
		// 2. ジムを作成
		const gymId = generateUUID();
		const gymResult = await dbClient.create("gyms", {
			gymId,
			name: data.name,
			ownerEmail: data.ownerEmail,
			phoneNumber: data.phoneNumber,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		if (!gymResult.success) {
			return c.json({ error: "ジムの作成に失敗しました: " + gymResult.error }, 500);
		}

		// 3. 管理者アカウントを作成
		// パスワードをハッシュ化
		const passwordHash = await hashPassword(data.password);
		const adminId = generateUUID();
		const adminResult = await dbClient.create("admin_accounts", {
			adminId,
			email: data.ownerEmail,
			name: data.ownerName,
			role: "admin", // 所有者は常にadmin権限
			passwordHash,
			isActive: 1, // SQLiteはブール値をサポートしないため数値で表現
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		if (!adminResult.success) {
			// 管理者アカウント作成に失敗した場合、作成したジムを削除（ロールバック相当）
			await dbClient.delete("gyms", gymId);
			return c.json({ error: "管理者アカウントの作成に失敗しました: " + adminResult.error }, 500);
		}

		// 4. ジムと管理者アカウントの関連付け
		const relationResult = await dbClient.create("admin_gym_relationships", {
			adminId,
			gymId,
			role: "owner", // ジム内での役割はオーナー
			createdAt: new Date().toISOString(),
		});

		if (!relationResult.success) {
			// 関連付けに失敗した場合、作成したジムと管理者アカウントを削除（ロールバック相当）
			await dbClient.delete("admin_accounts", adminId);
			await dbClient.delete("gyms", gymId);
			return c.json(
				{ error: "アカウントとジムの関連付けに失敗しました: " + relationResult.error },
				500,
			);
		}

		// 5. 成功レスポンスを返す
		return validatedJson(
			c,
			CreateGymAccountResponse,
			{
				message: "ジムアカウントが正常に発行されました",
				gymId,
				ownerId: adminId,
			},
			201,
		);
	} catch (error) {
		console.error("ジムアカウント発行中にエラーが発生しました:", error);
		return c.json({ error: "処理中にエラーが発生しました" }, 500);
	}
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

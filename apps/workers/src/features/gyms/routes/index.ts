import { Hono } from "hono";
import type { Env } from "../../../env";
import { getDatabaseClient } from "../../../lib/do-client";
import { adminOnlyMiddleware } from "../../../middlewares/auth";

// Gymルーター
export const gymRouter = new Hono<{ Bindings: Env }>();

// 開発用テストエンドポイントは削除

// 管理者用ルート
const adminRouter = new Hono<{ Bindings: Env }>().use(
	"*",
	adminOnlyMiddleware(),
);

// ジム一覧取得（管理者用）
adminRouter.get("/", async (c) => {
	const dbClient = getDatabaseClient(c.env);
	const result = await dbClient.list("gyms");

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return c.json({ gyms: result.data });
});

// ジム登録（管理者用）
adminRouter.post("/", async (c) => {
	const data = await c.req.json();

	// バリデーション
	if (!data.name || !data.ownerEmail) {
		return c.json({ error: "ジム名とオーナーメールアドレスは必須です" }, 400);
	}

	const dbClient = getDatabaseClient(c.env);
	const result = await dbClient.create("gyms", {
		...data,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	});

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return c.json(
		{
			message: "ジムが登録されました",
			gymId: result.id,
		},
		201,
	);
});

// ジム詳細取得
gymRouter.get("/:gymId", async (c) => {
	const gymId = c.req.param("gymId");

	const dbClient = getDatabaseClient(c.env);
	const result = await dbClient.getOne("gyms", gymId);

	if (!result.success) {
		return c.json({ error: "ジムが見つかりません" }, 404);
	}

	return c.json({ gym: result.data });
});

// ジム情報更新（管理者用）
adminRouter.patch("/:gymId", async (c) => {
	const gymId = c.req.param("gymId");
	const data = await c.req.json();

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

	return c.json({
		message: "ジム情報が更新されました",
	});
});

// ジム削除（管理者用）
adminRouter.delete("/:gymId", async (c) => {
	const gymId = c.req.param("gymId");

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

	return c.json({
		message: "ジムが削除されました",
	});
});

// 管理者用ルートをメインルーターにマウント
gymRouter.route("/admin", adminRouter);

export default gymRouter;

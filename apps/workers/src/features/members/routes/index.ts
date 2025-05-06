import { Hono } from "hono";
import type { Env } from "../../../env";
import { getDatabaseClient } from "../../../lib/clients";
import { adminOnlyMiddleware } from "../../../middlewares/auth";

// Memberルーター
export const memberRouter = new Hono<{ Bindings: Env }>();

// 管理者用ルート
const adminRouter = new Hono<{ Bindings: Env }>().use("*", adminOnlyMiddleware());

// 会員一覧取得（管理者用）
adminRouter.get("/", async (c) => {
	const dbClient = getDatabaseClient(c.env);

	// ジムIDでフィルタリングする場合
	const gymId = c.req.query("gymId");
	let result: { success: boolean; data?: unknown; error?: string };

	if (gymId) {
		result = await dbClient.list("members", { gym_id: gymId });
	} else {
		result = await dbClient.list("members");
	}

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return c.json({ members: result.data });
});

// 会員登録
adminRouter.post("/", async (c) => {
	const data = await c.req.json();

	// バリデーション
	if (!data.gymId || !data.name) {
		return c.json({ error: "ジムIDと会員名は必須です" }, 400);
	}

	const dbClient = getDatabaseClient(c.env);

	// ジムの存在確認
	const gymCheck = await dbClient.getOne("gyms", data.gymId);
	if (!gymCheck.success) {
		return c.json({ error: "指定されたジムが存在しません" }, 404);
	}

	const result = await dbClient.create("members", {
		...data,
		status: data.status || "active",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	});

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return c.json(
		{
			message: "会員が登録されました",
			memberId: result.id,
		},
		201,
	);
});

// 会員詳細取得
memberRouter.get("/:memberId", async (c) => {
	const memberId = c.req.param("memberId");

	const dbClient = getDatabaseClient(c.env);
	const result = await dbClient.getOne("members", memberId);

	if (!result.success) {
		return c.json({ error: "会員が見つかりません" }, 404);
	}

	return c.json({ member: result.data });
});

// 会員情報更新
memberRouter.patch("/:memberId", async (c) => {
	const memberId = c.req.param("memberId");
	const data = await c.req.json();

	const dbClient = getDatabaseClient(c.env);

	// 更新前に存在確認
	const checkResult = await dbClient.getOne("members", memberId);
	if (!checkResult.success) {
		return c.json({ error: "会員が見つかりません" }, 404);
	}

	// 更新処理
	const updateData = {
		...data,
		updatedAt: new Date().toISOString(),
	};

	const result = await dbClient.update("members", memberId, updateData);

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return c.json({
		message: "会員情報が更新されました",
	});
});

// 会員退会処理（ステータス変更）
memberRouter.post("/:memberId/withdraw", async (c) => {
	const memberId = c.req.param("memberId");

	const dbClient = getDatabaseClient(c.env);

	// 更新前に存在確認
	const checkResult = await dbClient.getOne("members", memberId);
	if (!checkResult.success) {
		return c.json({ error: "会員が見つかりません" }, 404);
	}

	// ステータス更新処理
	const result = await dbClient.update("members", memberId, {
		status: "withdrawn",
		updatedAt: new Date().toISOString(),
	});

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return c.json({
		message: "会員の退会処理が完了しました",
	});
});

// 会員削除（管理者用）
adminRouter.delete("/:memberId", async (c) => {
	const memberId = c.req.param("memberId");

	const dbClient = getDatabaseClient(c.env);

	// 削除前に存在確認
	const checkResult = await dbClient.getOne("members", memberId);
	if (!checkResult.success) {
		return c.json({ error: "会員が見つかりません" }, 404);
	}

	// 削除処理
	const result = await dbClient.delete("members", memberId);

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return c.json({
		message: "会員が削除されました",
	});
});

// 管理者用ルートをメインルーターにマウント
memberRouter.route("/admin", adminRouter);

export default memberRouter;

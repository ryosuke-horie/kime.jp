import { Hono } from "hono";
import type { Env } from "../../../env";
import { bookClass, getDatabaseClient } from "../../../lib/do-client";
import { adminOnlyMiddleware } from "../../../middlewares/auth";

// Bookingルーター
export const bookingRouter = new Hono<{ Bindings: Env }>();

// 管理者用ルート
const adminRouter = new Hono<{ Bindings: Env }>().use(
	"*",
	adminOnlyMiddleware(),
);

// 予約一覧取得
bookingRouter.get("/", async (c) => {
	const dbClient = getDatabaseClient(c.env);

	// 会員IDかクラスIDでフィルタリングする場合
	const memberId = c.req.query("memberId");
	const classId = c.req.query("classId");
	const gymId = c.req.query("gymId");

	const params: Record<string, string> = {};
	if (memberId) params.member_id = memberId;
	if (classId) params.class_id = classId;
	if (gymId) params.gym_id = gymId;

	const result = await dbClient.list(
		"bookings",
		Object.keys(params).length > 0 ? params : {},
	);

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return c.json({ bookings: result.data });
});

// 新規予約作成（Durable Objectのトランザクション処理を使用）
bookingRouter.post("/", async (c) => {
	const data = await c.req.json();

	// バリデーション
	if (!data.gymId || !data.classId || !data.memberId) {
		return c.json(
			{
				error: "ジムID、クラスID、会員IDは必須です",
			},
			400,
		);
	}

	try {
		// 専用の予約処理関数を使用（ClassLockerによるトランザクション）
		const result = await bookClass(c.env, {
			gymId: data.gymId,
			classId: data.classId,
			memberId: data.memberId,
		});

		if (result.error) {
			if (result.error.includes("fully booked")) {
				return c.json({ error: "クラスは満員です" }, 409);
			}
			if (result.error.includes("already has a booking")) {
				return c.json(
					{
						error: "既にこのクラスに予約があります",
						bookingId: result.bookingId,
					},
					409,
				);
			}
			if (result.error.includes("not found")) {
				return c.json({ error: "クラスが見つかりません" }, 404);
			}
			return c.json({ error: result.error }, 500);
		}

		return c.json(
			{
				message: "予約が完了しました",
				bookingId: result.bookingId,
			},
			201,
		);
	} catch (error) {
		return c.json(
			{
				error: "予約処理中にエラーが発生しました",
				details: error instanceof Error ? error.message : String(error),
			},
			500,
		);
	}
});

// 予約詳細取得
bookingRouter.get("/:bookingId", async (c) => {
	const bookingId = c.req.param("bookingId");

	const dbClient = getDatabaseClient(c.env);
	const result = await dbClient.getOne("bookings", bookingId);

	if (!result.success) {
		return c.json({ error: "予約が見つかりません" }, 404);
	}

	return c.json({ booking: result.data });
});

// 予約キャンセル
bookingRouter.post("/:bookingId/cancel", async (c) => {
	const bookingId = c.req.param("bookingId");

	const dbClient = getDatabaseClient(c.env);

	// 更新前に存在確認
	const checkResult = await dbClient.getOne("bookings", bookingId);
	if (!checkResult.success) {
		return c.json({ error: "予約が見つかりません" }, 404);
	}

	// 既にキャンセル済みでないか確認
	if (checkResult.data?.status === "cancelled") {
		return c.json({ error: "既にキャンセル済みの予約です" }, 400);
	}

	// ステータス更新処理
	const result = await dbClient.update("bookings", bookingId, {
		status: "cancelled",
		updatedAt: new Date().toISOString(),
	});

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return c.json({
		message: "予約がキャンセルされました",
	});
});

// 出席登録（管理者用）
adminRouter.post("/:bookingId/attend", async (c) => {
	const bookingId = c.req.param("bookingId");

	const dbClient = getDatabaseClient(c.env);

	// 更新前に存在確認
	const checkResult = await dbClient.getOne("bookings", bookingId);
	if (!checkResult.success) {
		return c.json({ error: "予約が見つかりません" }, 404);
	}

	// 既に出席済みでないか確認
	if (checkResult.data?.status === "attended") {
		return c.json({ error: "既に出席済みの予約です" }, 400);
	}

	// ステータス更新処理
	const result = await dbClient.update("bookings", bookingId, {
		status: "attended",
		updatedAt: new Date().toISOString(),
	});

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return c.json({
		message: "出席が登録されました",
	});
});

// 欠席登録（管理者用）
adminRouter.post("/:bookingId/no-show", async (c) => {
	const bookingId = c.req.param("bookingId");

	const dbClient = getDatabaseClient(c.env);

	// 更新前に存在確認
	const checkResult = await dbClient.getOne("bookings", bookingId);
	if (!checkResult.success) {
		return c.json({ error: "予約が見つかりません" }, 404);
	}

	// 既に欠席済みでないか確認
	if (checkResult.data?.status === "no_show") {
		return c.json({ error: "既に欠席済みの予約です" }, 400);
	}

	// ステータス更新処理
	const result = await dbClient.update("bookings", bookingId, {
		status: "no_show",
		updatedAt: new Date().toISOString(),
	});

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return c.json({
		message: "欠席が登録されました",
	});
});

// 予約削除（管理者用）
adminRouter.delete("/:bookingId", async (c) => {
	const bookingId = c.req.param("bookingId");

	const dbClient = getDatabaseClient(c.env);

	// 削除前に存在確認
	const checkResult = await dbClient.getOne("bookings", bookingId);
	if (!checkResult.success) {
		return c.json({ error: "予約が見つかりません" }, 404);
	}

	// 削除処理
	const result = await dbClient.delete("bookings", bookingId);

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return c.json({
		message: "予約が削除されました",
	});
});

// 管理者用ルートをメインルーターにマウント
bookingRouter.route("/admin", adminRouter);

export default bookingRouter;

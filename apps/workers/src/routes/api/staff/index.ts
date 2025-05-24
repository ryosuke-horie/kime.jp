/// <reference path="../../../../worker-configuration.d.ts" />
import { Hono } from "hono";
import { StaffController } from "../../../controllers/staff-controller";
import { jwtAuth } from "../../../middlewares/auth";

// Honoアプリケーションの型定義
type AppHono = Hono<{ Bindings: CloudflareBindings }>;

/**
 * スタッフ関連のAPIルーター
 */
export const staffRouter: AppHono = new Hono();

// 認証ミドルウェアを全てのルートに適用
const jwtMiddleware = jwtAuth(process.env.NODE_ENV === "test" ? "test-secret" : undefined);

// スタッフ一覧取得 (オーナーのみ)
// GET /api/staff
staffRouter.get("/", jwtMiddleware, (c) => {
	const controller = new StaffController(c.env.DB);
	return controller.getStaffList(c);
});

// スタッフ新規作成 (オーナーのみ)
// POST /api/staff
staffRouter.post("/", jwtMiddleware, (c) => {
	const controller = new StaffController(c.env.DB);
	return controller.createStaff(c);
});

// スタッフ情報更新 (オーナー または 自分のスタッフ)
// PUT /api/staff/:id
staffRouter.put("/:id", jwtMiddleware, (c) => {
	const controller = new StaffController(c.env.DB);
	return controller.updateStaff(c);
});

// スタッフ削除 (オーナーのみ)
// DELETE /api/staff/:id
staffRouter.delete("/:id", jwtMiddleware, (c) => {
	const controller = new StaffController(c.env.DB);
	return controller.deleteStaff(c);
});

// パスワード変更 (オーナー または 自分のスタッフ)
// PUT /api/staff/:id/password
staffRouter.put("/:id/password", jwtMiddleware, (c) => {
	const controller = new StaffController(c.env.DB);
	return controller.changePassword(c);
});

export default staffRouter;

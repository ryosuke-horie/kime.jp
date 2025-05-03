import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import type { Env } from "./env";
import { authMiddleware } from "./middlewares/auth";
import { ClassLocker } from "./objects/ClassLocker";
import { DatabaseDO } from "./objects/DatabaseDO";

import bookingRouter from "./features/bookings/routes";
import classRouter from "./features/classes/routes";
// 各機能のルーターをインポート
import gymRouter from "./features/gyms/routes";
import memberRouter from "./features/members/routes";

// アプリケーションインスタンスを作成
const app = new Hono<{ Bindings: Env }>();

// ミドルウェアを設定
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", cors());
app.use("/api/*", authMiddleware());

// ルートパス
app.get("/", (c) => {
	return c.text("Kime API - Hello!");
});

// ヘルスチェック
app.get("/health", (c) => {
	return c.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		version: "0.1.0",
	});
});

// 開発用テストエンドポイントは削除

// APIエンドポイント
const api = new Hono<{ Bindings: Env }>();

// 各機能のルーターをマウント
api.route("/gyms", gymRouter);
api.route("/members", memberRouter);
api.route("/classes", classRouter);
api.route("/bookings", bookingRouter);

// 開発用テストエンドポイントは削除

// APIルーターをメインアプリにマウント
app.route("/api", api);

// Workerエクスポート
export default {
	// Fetch ハンドラー
	fetch: app.fetch,

	// Durable Objects
	DatabaseDO,
	ClassLocker,
};

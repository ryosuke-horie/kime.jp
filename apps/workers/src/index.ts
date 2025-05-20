/// <reference path="../worker-configuration.d.ts" />
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { errorHandler } from "./middlewares/error-handler";
import router from "./routes";

// アプリケーションインスタンスを作成
const app = new Hono<{ Bindings: CloudflareBindings }>();

// ミドルウェアを設定
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", cors());
app.use("*", errorHandler); // グローバルエラーハンドラーを追加

// ルートパス
app.get("/", (c) => {
	return c.text("Kime API - Hello!");
});

// ルーターをマウント
app.route("/", router);

export default app;

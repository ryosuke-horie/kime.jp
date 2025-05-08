import { type Env, Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

// アプリケーションインスタンスを作成
const app = new Hono<{ Bindings: Env }>();

// ミドルウェアを設定
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", cors());

// ルートパス
app.get("/", (c) => {
	return c.text("Kime API - Hello!");
});

import { Hono } from "hono";
import apiRouter from "./api";

// ルート全体のルーター
const router = new Hono();

// APIルーターをマウント
router.route("/api", apiRouter);

export default router;

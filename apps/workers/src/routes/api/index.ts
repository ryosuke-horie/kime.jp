import { Hono } from "hono";
import gymsRouter from "./gyms";

// API 全体のルーター
const apiRouter = new Hono();

// 各リソースのルーターをマウント
apiRouter.route("/gyms", gymsRouter);

export default apiRouter;
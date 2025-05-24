import { Hono } from "hono";
import { authRouter } from "../auth";
import gymsRouter from "./gyms";

// API 全体のルーター
const apiRouter = new Hono();

// 各リソースのルーターをマウント
apiRouter.route("/gyms", gymsRouter);
apiRouter.route("/auth", authRouter);

export default apiRouter;

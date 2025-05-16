/// <reference path="../../../../worker-configuration.d.ts" />
import { Hono } from "hono";
import { GymController } from "../../../controllers/gym-controller";

// Honoアプリケーションの型定義
type AppHono = Hono<{ Bindings: CloudflareBindings }>;

/**
 * ジム関連のAPIルーター
 */
export const gymsRouter: AppHono = new Hono();

// 各ルートとコントローラーを接続
gymsRouter.get("/", (c) => {
	const controller = new GymController(c.env.DB);
	return controller.getGyms(c);
});

gymsRouter.get("/:gymId", (c) => {
	const controller = new GymController(c.env.DB);
	return controller.getGymById(c);
});

gymsRouter.post("/", (c) => {
	const controller = new GymController(c.env.DB);
	return controller.createGym(c);
});

gymsRouter.patch("/:gymId", (c) => {
	const controller = new GymController(c.env.DB);
	return controller.updateGym(c);
});

gymsRouter.put("/:gymId", (c) => {
	const controller = new GymController(c.env.DB);
	return controller.updateGymFull(c);
});

gymsRouter.delete("/:gymId", (c) => {
	const controller = new GymController(c.env.DB);
	return controller.deleteGym(c);
});

export default gymsRouter;

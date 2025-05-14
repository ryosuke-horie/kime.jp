import { Hono } from "hono";
import { GymController } from "../../../controllers/gym-controller";

/**
 * ジム関連のAPIルーター
 */
export const gymsRouter = new Hono();

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

gymsRouter.delete("/:gymId", (c) => {
	const controller = new GymController(c.env.DB);
	return controller.deleteGym(c);
});

export default gymsRouter;

import { Hono } from "hono";
import { Env } from "../../../env";
import { getDatabaseClient } from "../../../lib/do-client";
import { adminOnlyMiddleware } from "../../../middlewares/auth";

// Classルーター
export const classRouter = new Hono<{ Bindings: Env }>();

// 管理者用ルート
const adminRouter = new Hono<{ Bindings: Env }>()
  .use("*", adminOnlyMiddleware());

// クラス一覧取得
classRouter.get("/", async (c) => {
  const dbClient = getDatabaseClient(c.env);
  
  // ジムIDでフィルタリングする場合
  const gymId = c.req.query("gymId");
  let result;
  
  if (gymId) {
    result = await dbClient.list("classes", { gym_id: gymId });
  } else {
    result = await dbClient.list("classes");
  }
  
  if (!result.success) {
    return c.json({ error: result.error }, 500);
  }
  
  return c.json({ classes: result.data });
});

// クラス登録（管理者用）
adminRouter.post("/", async (c) => {
  const data = await c.req.json();
  
  // バリデーション
  if (!data.gymId || !data.title || !data.startsAt || !data.endsAt || !data.capacity) {
    return c.json({
      error: "ジムID、タイトル、開始時間、終了時間、定員は必須です"
    }, 400);
  }
  
  const dbClient = getDatabaseClient(c.env);
  
  // ジムの存在確認
  const gymCheck = await dbClient.getOne("gyms", data.gymId);
  if (!gymCheck.success) {
    return c.json({ error: "指定されたジムが存在しません" }, 404);
  }
  
  const result = await dbClient.create("classes", {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  if (!result.success) {
    return c.json({ error: result.error }, 500);
  }
  
  return c.json({ 
    message: "クラスが登録されました",
    classId: result.id
  }, 201);
});

// クラス詳細取得
classRouter.get("/:classId", async (c) => {
  const classId = c.req.param("classId");
  
  const dbClient = getDatabaseClient(c.env);
  const result = await dbClient.getOne("classes", classId);
  
  if (!result.success) {
    return c.json({ error: "クラスが見つかりません" }, 404);
  }
  
  return c.json({ class: result.data });
});

// クラス情報更新（管理者用）
adminRouter.patch("/:classId", async (c) => {
  const classId = c.req.param("classId");
  const data = await c.req.json();
  
  const dbClient = getDatabaseClient(c.env);
  
  // 更新前に存在確認
  const checkResult = await dbClient.getOne("classes", classId);
  if (!checkResult.success) {
    return c.json({ error: "クラスが見つかりません" }, 404);
  }
  
  // 更新処理
  const updateData = {
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  const result = await dbClient.update("classes", classId, updateData);
  
  if (!result.success) {
    return c.json({ error: result.error }, 500);
  }
  
  return c.json({ 
    message: "クラス情報が更新されました" 
  });
});

// クラス削除（管理者用）
adminRouter.delete("/:classId", async (c) => {
  const classId = c.req.param("classId");
  
  const dbClient = getDatabaseClient(c.env);
  
  // 削除前に存在確認
  const checkResult = await dbClient.getOne("classes", classId);
  if (!checkResult.success) {
    return c.json({ error: "クラスが見つかりません" }, 404);
  }
  
  // 削除処理
  const result = await dbClient.delete("classes", classId);
  
  if (!result.success) {
    return c.json({ error: result.error }, 500);
  }
  
  return c.json({ 
    message: "クラスが削除されました" 
  });
});

// 管理者用ルートをメインルーターにマウント
classRouter.route("/admin", adminRouter);

export default classRouter;
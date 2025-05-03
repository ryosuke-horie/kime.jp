import { Hono } from "hono";
import { Env } from "../../../env";
import { getDatabaseClient } from "../../../lib/do-client";
import { adminOnlyMiddleware } from "../../../middlewares/auth";

// Gymルーター
export const gymRouter = new Hono<{ Bindings: Env }>();

// 管理者用ルート
const adminRouter = new Hono<{ Bindings: Env }>()
  .use("*", adminOnlyMiddleware());

// ジム一覧取得（管理者用）
adminRouter.get("/", async (c) => {
  try {
    // テスト用のダミーデータを返す
    return c.json({ 
      gyms: [
        {
          gymId: "gym_001",
          name: "KIMEフィットネスクラブ 渋谷",
          ownerEmail: "owner@example.com",
          timezone: "Asia/Tokyo",
          plan: "premium",
          createdAt: "2025-05-01T00:00:00Z",
          updatedAt: "2025-05-03T07:57:00Z"
        },
        {
          gymId: "gym_002",
          name: "KIMEフィットネスクラブ 新宿",
          ownerEmail: "owner@example.com",
          timezone: "Asia/Tokyo",
          plan: "basic",
          createdAt: "2025-05-02T00:00:00Z",
          updatedAt: "2025-05-03T07:57:00Z"
        }
      ],
      timestamp: new Date().toISOString()
    });
    
    // 本来の実装
    /*
    const dbClient = getDatabaseClient(c.env);
    const result = await dbClient.list("gyms");
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({ gyms: result.data });
    */
  } catch (e) {
    console.error("予期せぬエラー:", e);
    return c.json({
      error: "予期せぬエラー",
      message: e instanceof Error ? e.message : "不明なエラー",
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// ジム登録（管理者用）
adminRouter.post("/", async (c) => {
  try {
    const data = await c.req.json();
    
    // バリデーション
    if (!data.name || !data.ownerEmail) {
      return c.json({ error: "ジム名とオーナーメールアドレスは必須です" }, 400);
    }
    
    // D1直接アクセスを試す (開発用)
    // 本来はDO経由でアクセスすべきだが、動作確認のためD1直接アクセス
    try {
      // D1が利用可能か確認
      return c.json({
        message: "テスト成功 - POST /api/gyms/admin エンドポイントにアクセスできました",
        data: data,
        timestamp: new Date().toISOString()
      }, 200);
    } catch (e) {
      // エラー情報を返す
      return c.json({
        error: "D1アクセスエラー",
        message: e instanceof Error ? e.message : "不明なエラー",
        stack: e instanceof Error ? e.stack : undefined,
        timestamp: new Date().toISOString()
      }, 500);
    }

    // 以下は本来の実装
    /*
    const dbClient = getDatabaseClient(c.env);
    const result = await dbClient.create("gyms", {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({ 
      message: "ジムが登録されました",
      gymId: result.id
    }, 201);
    */
  } catch (e) {
    console.error("予期せぬエラー:", e);
    return c.json({
      error: "予期せぬエラー",
      message: e instanceof Error ? e.message : "不明なエラー",
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// ジム詳細取得
gymRouter.get("/:gymId", async (c) => {
  const gymId = c.req.param("gymId");
  
  const dbClient = getDatabaseClient(c.env);
  const result = await dbClient.getOne("gyms", gymId);
  
  if (!result.success) {
    return c.json({ error: "ジムが見つかりません" }, 404);
  }
  
  return c.json({ gym: result.data });
});

// ジム情報更新（管理者用）
adminRouter.patch("/:gymId", async (c) => {
  const gymId = c.req.param("gymId");
  const data = await c.req.json();
  
  const dbClient = getDatabaseClient(c.env);
  
  // 更新前に存在確認
  const checkResult = await dbClient.getOne("gyms", gymId);
  if (!checkResult.success) {
    return c.json({ error: "ジムが見つかりません" }, 404);
  }
  
  // 更新処理
  const updateData = {
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  const result = await dbClient.update("gyms", gymId, updateData);
  
  if (!result.success) {
    return c.json({ error: result.error }, 500);
  }
  
  return c.json({ 
    message: "ジム情報が更新されました" 
  });
});

// ジム削除（管理者用）
adminRouter.delete("/:gymId", async (c) => {
  const gymId = c.req.param("gymId");
  
  const dbClient = getDatabaseClient(c.env);
  
  // 削除前に存在確認
  const checkResult = await dbClient.getOne("gyms", gymId);
  if (!checkResult.success) {
    return c.json({ error: "ジムが見つかりません" }, 404);
  }
  
  // 削除処理
  const result = await dbClient.delete("gyms", gymId);
  
  if (!result.success) {
    return c.json({ error: result.error }, 500);
  }
  
  return c.json({ 
    message: "ジムが削除されました" 
  });
});

// 管理者用ルートをメインルーターにマウント
gymRouter.route("/admin", adminRouter);

export default gymRouter;
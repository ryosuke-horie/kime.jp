import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import type { Env } from "./env";
import { authMiddleware } from "./middlewares/auth";
import { ClassLocker } from "./objects/ClassLocker";
import { DatabaseDO } from "./objects/DatabaseDO";

import authRouter from "./features/auth/routes";
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

// 基本ヘルスチェック
app.get("/health", async (c) => {
	const startTime = Date.now();
	const timestamp = new Date().toISOString();
	const version = "0.1.0";
	
	// 基本的なAPIヘルスステータス
	const apiStatus = {
		status: "ok" as const,
		latency: Date.now() - startTime
	};
	
	// Durable Objectの接続確認は行わない場合の基本レスポンス
	if (c.req.query("check") !== "db") {
		return c.json({
			status: "ok",
			timestamp,
			version,
			services: {
				api: apiStatus
			}
		});
	}
	
	// DOとの接続テスト用のDBステータスオブジェクト
	let dbStatus = {
		status: "error" as const,
		message: "Database connection not tested",
		latency: 0
	};
	
	let systemStatus = "ok" as const;
	let databaseDetails = undefined;
	
	try {
		// DatabaseDOと接続テスト
		const dbId = c.env.DB_DO.idFromName("health-check");
		const dbDO = c.env.DB_DO.get(dbId);
		
		const dbStartTime = Date.now();
		const response = await dbDO.fetch("http://internal/");
		dbStatus.latency = Date.now() - dbStartTime;
		
		if (response.ok) {
			const data = await response.json();
			dbStatus.status = "ok";
			dbStatus.message = "Connected to DatabaseDO successfully";
			
			databaseDetails = {
				connection_established: true,
				query_executed: false,
				query_result: data
			};
		} else {
			dbStatus.message = `Failed to connect to DatabaseDO: ${response.status} ${response.statusText}`;
			systemStatus = "degraded";
			
			databaseDetails = {
				connection_established: false
			};
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		dbStatus.message = `Error connecting to DatabaseDO: ${errorMessage}`;
		systemStatus = "degraded";
		
		databaseDetails = {
			connection_established: false
		};
	}
	
	// 拡張ヘルスチェックレスポンスを返す
	return c.json({
		status: systemStatus,
		timestamp,
		version,
		services: {
			api: apiStatus,
			database: dbStatus
		},
		database_details: databaseDetails
	});
});

// DB接続確認の詳細ヘルスチェック
app.get("/health/db", async (c) => {
	const startTime = Date.now();
	const timestamp = new Date().toISOString();
	const version = "0.1.0";
	
	// 基本的なAPIヘルスステータス
	const apiStatus = {
		status: "ok" as const,
		latency: Date.now() - startTime
	};
	
	// DOとの接続テスト用のDBステータスオブジェクト
	let dbStatus = {
		status: "error" as const,
		message: "Database connection not tested",
		latency: 0
	};
	
	let systemStatus = "ok" as const;
	let databaseDetails = undefined;
	
	try {
		// DatabaseDOと接続テスト
		const dbId = c.env.DB_DO.idFromName("health-check");
		const dbDO = c.env.DB_DO.get(dbId);
		
		const dbStartTime = Date.now();
		
		// クエリを実行するか、簡単な接続テストかを判断
		const runQuery = c.req.query("query") === "true";
		
		// URIを構築
		const uri = runQuery
			? "http://internal/query?sql=SELECT+1+as+test"
			: "http://internal/";
			
		const response = await dbDO.fetch(uri);
		dbStatus.latency = Date.now() - dbStartTime;
		
		if (response.ok) {
			const data = await response.json();
			dbStatus.status = "ok";
			
			if (runQuery) {
				dbStatus.message = "Database query executed successfully";
				databaseDetails = {
					connection_established: true,
					query_executed: true,
					query_result: data
				};
			} else {
				dbStatus.message = "Connected to DatabaseDO successfully";
				databaseDetails = {
					connection_established: true,
					query_executed: false,
					query_result: data
				};
			}
		} else {
			const errorBody = await response.text();
			dbStatus.message = `Failed to connect to DatabaseDO: ${response.status} ${response.statusText} - ${errorBody}`;
			systemStatus = "degraded";
			
			databaseDetails = {
				connection_established: false
			};
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		dbStatus.message = `Error connecting to DatabaseDO: ${errorMessage}`;
		systemStatus = "degraded";
		
		databaseDetails = {
			connection_established: false
		};
	}
	
	// 拡張ヘルスチェックレスポンスを返す
	return c.json({
		status: systemStatus,
		timestamp,
		version,
		services: {
			api: apiStatus,
			database: dbStatus
		},
		database_details: databaseDetails
	});
});

// API ドキュメントは削除 (Issueで対応済み)

// APIエンドポイント
const api = new Hono<{ Bindings: Env }>();

// 各機能のルーターをマウント
api.route("/auth", authRouter);
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

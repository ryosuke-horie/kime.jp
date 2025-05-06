// DatabaseDO - D1データベースへのアクセスを管理するDurable Object
import * as schema from "../db";
import type { NewBooking, NewClass, NewGym, NewMember } from "../db";

// ステータス型の定義（後でスキーマから正確な型をインポートする予定）
type MemberStatus = string;
type BookingStatus = string;
import { and, eq, sql } from "drizzle-orm";
// DatabaseDO.ts - D1データベースへのアクセスを管理するDurable Object
import { createD1Client, generateUUID } from "../lib/db-client";

interface Env {
	DB: D1Database;
}

export class DatabaseDO {
	private db: ReturnType<typeof createD1Client> | null = null;

	constructor(private state: DurableObjectState) {
		// DO初期化時にはD1はバインドされていないため、fetch内で初期化する
	}

	// Worker EnvironmentからのHTTP fetchイベントを処理
	async fetch(request: Request): Promise<Response> {
		const env = (request as unknown as { cf?: { env: Env } }).cf?.env;

		// D1がバインドされているか確認
		if (!env?.DB) {
			return new Response(JSON.stringify({ error: "D1 database not bound" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Drizzleクライアントの初期化（初回のみ）
		if (!this.db) {
			this.db = createD1Client(env.DB);
		}

		// リクエストURLからメソッドを解析
		const url = new URL(request.url);
		const path = url.pathname.split("/").filter(Boolean);

		// ルートパスはDOの状態を返す
		if (path.length === 0) {
			return new Response(JSON.stringify({ status: "ok", type: "DatabaseDO" }), {
				headers: { "Content-Type": "application/json" },
			});
		}

		const action = path[0];

		// リクエストボディをJSONとして解析（必要な場合）
		let body = null;
		if (["create", "update", "transaction"].includes(action) && request.method !== "GET") {
			try {
				body = await request.json();
			} catch (e) {
				return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}
		}

		// D1を使用するため、トランザクションはD1のネイティブ機能を使用
		switch (action) {
			case "query":
				return this.handleQuery(request);
			case "transaction":
				return this.handleTransaction(body);
			case "get":
				return this.handleGet(path[1], path[2]);
			case "list":
				return this.handleList(path[1], request);
			case "create":
				return this.handleCreate(path[1], body);
			case "update":
				return this.handleUpdate(path[1], path[2], body);
			case "delete":
				return this.handleDelete(path[1], path[2]);
			case "booking":
				// 予約の整合性確保のための特殊なエンドポイント
				return this.handleBooking(body);
			default:
				return new Response(JSON.stringify({ error: "Method not implemented" }), {
					status: 501,
					headers: { "Content-Type": "application/json" },
				});
		}
	}

	// クエリ実行ハンドラ
	private async handleQuery(request: Request): Promise<Response> {
		try {
			const url = new URL(request.url);

			// POST メソッドの場合はテーブルのQueryをチェック
			if (request.method === "POST") {
				// テーブル名をパスから取得
				const path = url.pathname.split("/").filter(Boolean);
				if (path.length >= 2 && path[0] === "query") {
					const table = path[1];
					try {
						const body = await request.json();

						// 特定のテーブル用のクエリ対応
						switch (table) {
							case "admin_accounts": {
								// adminAccounts テーブルに対する条件付きクエリ
								const conditions = body.conditions || {};
								const result = await this.db?.query.adminAccounts.findFirst({
									where: (fields, operators) => {
										const whereClauses = [];

										if (conditions.email) {
											whereClauses.push(operators.eq(fields.email, conditions.email));
										}

										// その他の条件があれば追加

										return whereClauses.length ? operators.and(...whereClauses) : undefined;
									},
								});

								return new Response(
									JSON.stringify({
										success: !!result,
										data: result || null,
									}),
									{ headers: { "Content-Type": "application/json" } },
								);
							}
						}
					} catch (e) {
						console.error("Query JSON parsing error:", e);
					}
				}
			}

			// 通常のSQLクエリ処理
			const sqlQuery = url.searchParams.get("sql");

			if (!sqlQuery) {
				return new Response(JSON.stringify({ error: "SQL query is required" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}

			// executeメソッドがないため、run/queryメソッドを使用
			const stmt = this.db?.prepare(sqlQuery);
			const result = stmt ? await stmt.run() : null;

			return new Response(JSON.stringify({ success: true, result }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return new Response(JSON.stringify({ error: errorMessage }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	}

	// トランザクション実行ハンドラ
	private async handleTransaction(body: {
		queries?: string[];
	}): Promise<Response> {
		if (!body || !Array.isArray(body.queries)) {
			return new Response(JSON.stringify({ error: "Transaction requires 'queries' array" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		try {
			// D1のbatchを使用してトランザクションを模倣
			const results = [];

			// トランザクションブロック
			await this.state.blockConcurrencyWhile(async () => {
				for (const query of body.queries) {
					// executeメソッドがないため、run/queryメソッドを使用
					const stmt = this.db?.prepare(query);
					const result = stmt ? await stmt.run() : null;
					results.push(result);
				}
			});

			return new Response(JSON.stringify({ success: true, results }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return new Response(JSON.stringify({ error: errorMessage }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	}

	// 単一レコード取得ハンドラ
	private async handleGet(table: string, id: string): Promise<Response> {
		if (!table || !id) {
			return new Response(JSON.stringify({ error: "Table and ID are required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		try {
			let result = null;

			// テーブルに応じたクエリを実行
			switch (table) {
				case "gyms":
					result = await this.db?.select().from(schema.gyms).where(eq(schema.gyms.gymId, id)).get();
					break;
				case "members":
					result = await this.db
						?.select()
						.from(schema.members)
						.where(eq(schema.members.memberId, id))
						.get();
					break;
				case "classes":
					result = await this.db
						?.select()
						.from(schema.classes)
						.where(eq(schema.classes.classId, id))
						.get();
					break;
				case "bookings":
					result = await this.db
						?.select()
						.from(schema.bookings)
						.where(eq(schema.bookings.bookingId, id))
						.get();
					break;
				// 他のテーブルも同様に追加可能
				default:
					return new Response(JSON.stringify({ error: "Unknown table" }), {
						status: 400,
						headers: { "Content-Type": "application/json" },
					});
			}

			if (!result) {
				return new Response(JSON.stringify({ error: "Record not found" }), {
					status: 404,
					headers: { "Content-Type": "application/json" },
				});
			}

			return new Response(JSON.stringify({ success: true, data: result }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return new Response(JSON.stringify({ error: errorMessage }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	}

	// 複数レコード取得ハンドラ
	private async handleList(table: string, request: Request): Promise<Response> {
		if (!table) {
			return new Response(JSON.stringify({ error: "Table is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		try {
			const url = new URL(request.url);
			const limit = Number.parseInt(url.searchParams.get("limit") || "100");
			const offset = Number.parseInt(url.searchParams.get("offset") || "0");
			const gymId = url.searchParams.get("gym_id");

			let results = [];

			// テーブルに応じたクエリを実行
			switch (table) {
				case "gyms":
					results = await this.db?.select().from(schema.gyms).limit(limit).offset(offset).all();
					break;
				case "members":
					if (gymId) {
						results = await this.db
							?.select()
							.from(schema.members)
							.where(eq(schema.members.gymId, gymId))
							.limit(limit)
							.offset(offset)
							.all();
					} else {
						results = await this.db
							?.select()
							.from(schema.members)
							.limit(limit)
							.offset(offset)
							.all();
					}
					break;
				case "classes":
					if (gymId) {
						results = await this.db
							?.select()
							.from(schema.classes)
							.where(eq(schema.classes.gymId, gymId))
							.limit(limit)
							.offset(offset)
							.all();
					} else {
						results = await this.db
							?.select()
							.from(schema.classes)
							.limit(limit)
							.offset(offset)
							.all();
					}
					break;
				case "bookings":
					if (gymId) {
						results = await this.db
							?.select()
							.from(schema.bookings)
							.where(eq(schema.bookings.gymId, gymId))
							.limit(limit)
							.offset(offset)
							.all();
					} else {
						results = await this.db
							?.select()
							.from(schema.bookings)
							.limit(limit)
							.offset(offset)
							.all();
					}
					break;
				// 他のテーブルも同様に追加可能
				default:
					return new Response(JSON.stringify({ error: "Unknown table" }), {
						status: 400,
						headers: { "Content-Type": "application/json" },
					});
			}

			return new Response(JSON.stringify({ success: true, data: results }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return new Response(JSON.stringify({ error: errorMessage }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	}

	// レコード作成ハンドラ
	private async handleCreate(table: string, data: Record<string, unknown>): Promise<Response> {
		if (!table || !data) {
			return new Response(JSON.stringify({ error: "Table and data are required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		try {
			// IDが指定されていない場合は生成する
			switch (table) {
				case "gyms": {
					const gymId = !data.gymId ? generateUUID() : String(data.gymId);
					// Drizzle型定義に合わせてデータをキャスト
					const gymData: NewGym = {
						gymId,
						name: String(data.name),
						timezone: data.timezone ? String(data.timezone) : undefined,
						ownerEmail: String(data.ownerEmail),
						plan: data.plan ? String(data.plan) : undefined,
						createdAt: data.createdAt ? String(data.createdAt) : undefined,
						updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
					};
					await this.db?.insert(schema.gyms).values(gymData);
					data.gymId = gymId; // レスポンス用に保存
					break;
				}
				case "members": {
					const memberId = !data.memberId ? generateUUID() : String(data.memberId);
					// Drizzle型定義に合わせてデータをキャスト
					const memberData: NewMember = {
						memberId,
						gymId: String(data.gymId),
						name: String(data.name),
						email: data.email ? String(data.email) : undefined,
						phone: data.phone ? String(data.phone) : undefined,
						status: data.status ? (String(data.status) as MemberStatus) : undefined,
						joinedAt: data.joinedAt ? String(data.joinedAt) : undefined,
						policyVersion: data.policyVersion ? String(data.policyVersion) : undefined,
						policySignedAt: data.policySignedAt ? String(data.policySignedAt) : undefined,
						createdAt: data.createdAt ? String(data.createdAt) : undefined,
						updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
					};
					await this.db?.insert(schema.members).values(memberData);
					data.memberId = memberId; // レスポンス用に保存
					break;
				}
				case "classes": {
					const classId = !data.classId ? generateUUID() : String(data.classId);
					// Drizzle型定義に合わせてデータをキャスト
					const classData: NewClass = {
						classId,
						gymId: String(data.gymId),
						title: String(data.title),
						startsAt: String(data.startsAt),
						endsAt: String(data.endsAt),
						capacity: Number(data.capacity),
						instructor: data.instructor ? String(data.instructor) : undefined,
						createdAt: data.createdAt ? String(data.createdAt) : undefined,
						updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
					};
					await this.db?.insert(schema.classes).values(classData);
					data.classId = classId; // レスポンス用に保存
					break;
				}
				case "bookings": {
					const bookingId = generateUUID();
					// Drizzle型定義に合わせてデータをキャスト
					const bookingData: NewBooking = {
						bookingId,
						gymId: String(data.gymId),
						classId: String(data.classId),
						memberId: String(data.memberId),
						status: data.status ? (String(data.status) as BookingStatus) : undefined,
						bookedAt: data.bookedAt ? String(data.bookedAt) : undefined,
					};
					await this.db?.insert(schema.bookings).values(bookingData);
					data.bookingId = bookingId; // レスポンス用に保存
					break;
				}
				case "admin_accounts": {
					const adminId = !data.adminId ? generateUUID() : String(data.adminId);
					// adminAccountsテーブル用のデータ作成
					const adminData = {
						adminId,
						email: String(data.email),
						name: String(data.name),
						role: data.role ? String(data.role) : undefined,
						passwordHash: data.passwordHash ? String(data.passwordHash) : undefined,
						isActive: data.isActive !== undefined ? Number(data.isActive) : 1,
						lastLoginAt: data.lastLoginAt ? String(data.lastLoginAt) : undefined,
						createdAt: data.createdAt ? String(data.createdAt) : undefined,
						updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
					};
					await this.db?.insert(schema.adminAccounts).values(adminData);
					data.adminId = adminId; // レスポンス用に保存
					break;
				}
				case "admin_gym_relationships": {
					const relationData = {
						adminId: String(data.adminId),
						gymId: String(data.gymId),
						role: data.role ? String(data.role) : "staff",
						createdAt: data.createdAt ? String(data.createdAt) : undefined,
					};
					await this.db?.insert(schema.adminGymRelationships).values(relationData);
					break;
				}
				// 他のテーブルも同様に追加可能
				default:
					return new Response(JSON.stringify({ error: "Unknown table" }), {
						status: 400,
						headers: { "Content-Type": "application/json" },
					});
			}

			return new Response(
				JSON.stringify({
					success: true,
					id: data.gymId || data.memberId || data.classId || data.bookingId,
				}),
				{
					headers: { "Content-Type": "application/json" },
				},
			);
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return new Response(JSON.stringify({ error: errorMessage }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	}

	// レコード更新ハンドラ
	private async handleUpdate(
		table: string,
		id: string,
		data: Record<string, unknown>,
	): Promise<Response> {
		if (!table || !id || !data) {
			return new Response(JSON.stringify({ error: "Table, ID and data are required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		try {
			// 更新処理
			switch (table) {
				case "gyms":
					await this.db?.update(schema.gyms).set(data).where(eq(schema.gyms.gymId, id));
					break;
				case "members":
					await this.db?.update(schema.members).set(data).where(eq(schema.members.memberId, id));
					break;
				case "classes":
					await this.db?.update(schema.classes).set(data).where(eq(schema.classes.classId, id));
					break;
				case "bookings":
					await this.db?.update(schema.bookings).set(data).where(eq(schema.bookings.bookingId, id));
					break;
				// 他のテーブルも同様に追加可能
				default:
					return new Response(JSON.stringify({ error: "Unknown table" }), {
						status: 400,
						headers: { "Content-Type": "application/json" },
					});
			}

			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return new Response(JSON.stringify({ error: errorMessage }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	}

	// レコード削除ハンドラ
	private async handleDelete(table: string, id: string): Promise<Response> {
		if (!table || !id) {
			return new Response(JSON.stringify({ error: "Table and ID are required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		try {
			// 削除処理
			switch (table) {
				case "gyms":
					await this.db?.delete(schema.gyms).where(eq(schema.gyms.gymId, id));
					break;
				case "members":
					await this.db?.delete(schema.members).where(eq(schema.members.memberId, id));
					break;
				case "classes":
					await this.db?.delete(schema.classes).where(eq(schema.classes.classId, id));
					break;
				case "bookings":
					await this.db?.delete(schema.bookings).where(eq(schema.bookings.bookingId, id));
					break;
				// 他のテーブルも同様に追加可能
				default:
					return new Response(JSON.stringify({ error: "Unknown table" }), {
						status: 400,
						headers: { "Content-Type": "application/json" },
					});
			}

			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return new Response(JSON.stringify({ error: errorMessage }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	}

	// 予約処理（整合性確保のため特別な処理）
	private async handleBooking(data: {
		classId?: string;
		memberId?: string;
		gymId?: string;
	}): Promise<Response> {
		if (!data || !data.classId || !data.memberId || !data.gymId) {
			return new Response(
				JSON.stringify({
					error: "Class ID, Member ID and Gym ID are required",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		try {
			// トランザクションのためにblockConcurrencyWhileを使用
			return await this.state.blockConcurrencyWhile(async () => {
				// 1. クラスの存在確認
				const classData = await this.db
					?.select()
					.from(schema.classes)
					.where(eq(schema.classes.classId, data.classId))
					.get();

				if (!classData) {
					return new Response(JSON.stringify({ error: "Class not found" }), {
						status: 404,
						headers: { "Content-Type": "application/json" },
					});
				}

				// 2. 予約数の確認
				const bookingsResult = await this.db
					?.select({
						count: sql<number>`count(*)`,
					})
					.from(schema.bookings)
					.where(
						and(eq(schema.bookings.classId, data.classId), eq(schema.bookings.status, "reserved")),
					)
					.get();

				const bookingsCount = bookingsResult?.count || 0;

				if (bookingsCount >= classData.capacity) {
					return new Response(JSON.stringify({ error: "Class is fully booked" }), {
						status: 409,
						headers: { "Content-Type": "application/json" },
					});
				}

				// 3. 既存予約の確認（二重予約防止）
				const existingBooking = await this.db
					?.select()
					.from(schema.bookings)
					.where(
						and(
							eq(schema.bookings.classId, data.classId),
							eq(schema.bookings.memberId, data.memberId),
						),
					)
					.get();

				if (existingBooking) {
					return new Response(
						JSON.stringify({
							error: "Member already has a booking for this class",
							bookingId: existingBooking.bookingId,
						}),
						{
							status: 409,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				// 4. 予約を作成
				// Drizzle型定義に合わせてデータをキャスト
				const bookingId = generateUUID();
				const bookingData: NewBooking = {
					bookingId,
					classId: String(data.classId),
					memberId: String(data.memberId),
					gymId: String(data.gymId),
					status: "reserved", // 型安全性のために固定値を使用
					bookedAt: new Date().toISOString(),
				};
				await this.db?.insert(schema.bookings).values(bookingData);

				return new Response(JSON.stringify({ success: true, bookingId }), {
					headers: { "Content-Type": "application/json" },
				});
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return new Response(JSON.stringify({ error: errorMessage }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	}
}

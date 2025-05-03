import type { Env } from "../env";

// URLをRequest型に変換するヘルパー関数
function urlToRequest(url: URL, options?: RequestInit): Request {
	return new Request(url.toString(), options);
}

// DatabaseDOのレスポンス型定義
interface DBResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	id?: string; // 新規作成時に返されるID
}

// BookingレスポンスのためのDB特殊レスポンス型
interface BookingResponse extends DBResponse {
	bookingId?: string;
}

// DatabaseDO（データベースアクセス用DO）への簡易アクセス関数
export function getDatabaseClient(env: Env, id = "default") {
	// 固定のIDを使用してDOインスタンスを取得する（シングルトンパターン）
	const doId = env.DB_DO.idFromName(id);
	const doDatabaseObj = env.DB_DO.get(doId);

	return {
		// DBの単一レコード取得
		async getOne<T = Record<string, unknown>>(
			table: string,
			id: string,
		): Promise<DBResponse<T>> {
			const url = new URL(`/get/${table}/${id}`, "http://internal.do");
			const response = await doDatabaseObj.fetch(urlToRequest(url));
			return (await response.json()) as DBResponse<T>;
		},

		// DBのレコード一覧取得
		async list<T = Record<string, unknown>[]>(
			table: string,
			params: Record<string, string> = {},
		): Promise<DBResponse<T>> {
			const url = new URL(`/list/${table}`, "http://internal.do");
			for (const [key, value] of Object.entries(params)) {
				url.searchParams.append(key, value);
			}
			const response = await doDatabaseObj.fetch(urlToRequest(url));
			return (await response.json()) as DBResponse<T>;
		},

		// DBのレコード作成
		async create<T = Record<string, unknown>>(
			table: string,
			data: Record<string, unknown>,
		): Promise<DBResponse<T>> {
			const url = new URL(`/create/${table}`, "http://internal.do");
			const response = await doDatabaseObj.fetch(
				urlToRequest(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				}),
			);
			return (await response.json()) as DBResponse<T>;
		},

		// DBのレコード更新
		async update<T = Record<string, unknown>>(
			table: string,
			id: string,
			data: Record<string, unknown>,
		): Promise<DBResponse<T>> {
			const url = new URL(`/update/${table}/${id}`, "http://internal.do");
			const response = await doDatabaseObj.fetch(
				urlToRequest(url, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				}),
			);
			return (await response.json()) as DBResponse<T>;
		},

		// DBのレコード削除
		async delete(table: string, id: string): Promise<DBResponse> {
			const url = new URL(`/delete/${table}/${id}`, "http://internal.do");
			const response = await doDatabaseObj.fetch(
				urlToRequest(url, {
					method: "DELETE",
				}),
			);
			return (await response.json()) as DBResponse;
		},

		// DBのトランザクション実行
		async transaction(queries: string[]): Promise<DBResponse> {
			const url = new URL("/transaction", "http://internal.do");
			const response = await doDatabaseObj.fetch(
				urlToRequest(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ queries }),
				}),
			);
			return (await response.json()) as DBResponse;
		},

		// カスタムSQLクエリの実行
		async query<T = unknown>(sql: string): Promise<DBResponse<T>> {
			const url = new URL("/query", "http://internal.do");
			url.searchParams.append("sql", sql);
			const response = await doDatabaseObj.fetch(urlToRequest(url));
			return (await response.json()) as DBResponse<T>;
		},
	};
}

// ClassLockerのレスポンス型定義
interface ClassLockerResponse {
	success: boolean;
	message?: string;
	error?: string;
	locked?: boolean;
}

// ClassLocker（予約整合性確保用DO）への簡易アクセス関数
export function getClassLockerClient(env: Env, classId: string) {
	// クラスIDごとに異なるDOインスタンスを取得する
	const doId = env.CLASS_LOCKER.idFromName(classId);
	const doClassLockerObj = env.CLASS_LOCKER.get(doId);

	return {
		// 予約ロックの取得
		async lock(): Promise<ClassLockerResponse> {
			const url = new URL(`/lock/${classId}`, "http://internal.do");
			const response = await doClassLockerObj.fetch(
				urlToRequest(url, {
					method: "POST",
				}),
			);
			return (await response.json()) as ClassLockerResponse;
		},

		// 予約ロックの解除
		async unlock(): Promise<ClassLockerResponse> {
			const url = new URL(`/unlock/${classId}`, "http://internal.do");
			const response = await doClassLockerObj.fetch(
				urlToRequest(url, {
					method: "POST",
				}),
			);
			return (await response.json()) as ClassLockerResponse;
		},

		// ロック状態の確認
		async check(): Promise<ClassLockerResponse> {
			const url = new URL(`/check/${classId}`, "http://internal.do");
			const response = await doClassLockerObj.fetch(urlToRequest(url));
			return (await response.json()) as ClassLockerResponse;
		},
	};
}

// 予約処理の専用関数（DatabaseDOの予約専用エンドポイントを使用）
export async function bookClass(
	env: Env,
	data: {
		gymId: string;
		classId: string;
		memberId: string;
	},
): Promise<BookingResponse> {
	// 予約専用エンドポイントを呼び出し
	const url = new URL("/booking", "http://internal.do");
	const doDatabaseObj = env.DB_DO.get(env.DB_DO.idFromName("default"));

	const response = await doDatabaseObj.fetch(
		urlToRequest(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		}),
	);

	return (await response.json()) as BookingResponse;
}

import type { Context, Next } from "hono";
/**
 * 認証関連のモックユーティリティ
 * JWT関連のモックトークンやコンテキスト生成、ヘッダー設定などを提供
 */
import { vi } from "vitest";
import type { Env } from "../env";
import type { D1Database } from "../env";
import type { Database } from "../lib/database";
import type { AppContext } from "../middlewares/auth";
import type { AdminAccountType } from "../types/auth";

/**
 * テスト用の有効なJWTトークンを生成する
 * ペイロードは指定されたpropsでカスタマイズ可能
 * @param props トークンペイロードの一部またはカスタムパラメータ
 * @returns 有効なJWTトークン（テスト用）
 */
export function createMockJwtToken(
	props: {
		adminId?: string;
		email?: string;
		name?: string;
		role?: "admin" | "staff";
		isActive?: boolean;
		iat?: number;
		exp?: number;
	} = {},
) {
	// デフォルト値
	const {
		adminId = "admin-123",
		email = "admin@example.com",
		name = "Test Admin",
		role = "admin",
		iat = Math.floor(Date.now() / 1000),
		exp = Math.floor(Date.now() / 1000) + 60 * 60, // 1時間
	} = props;

	// ペイロード生成
	const payload = {
		sub: adminId,
		email,
		name,
		role,
		iat,
		exp,
	};

	// Base64エンコードされたヘッダー
	const header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"; // {"alg":"HS256","typ":"JWT"}

	// ペイロードをBase64エンコード
	const payloadBase64 = btoa(JSON.stringify(payload))
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");

	// ダミー署名
	const signature = "dummy_signature_for_testing";

	// トークン結合
	return `${header}.${payloadBase64}.${signature}`;
}

/**
 * 認証済みの管理者オブジェクトを生成する
 * @param role 管理者ロール（"admin" または "staff"）
 * @returns 管理者アカウントオブジェクト
 */
export function createMockAdmin(role: "admin" | "staff" = "admin"): AdminAccountType {
	return {
		adminId: role === "admin" ? "admin-123" : "staff-456",
		email: `${role}@example.com`,
		name: `Test ${role === "admin" ? "Admin" : "Staff"}`,
		role,
		isActive: true,
	};
}

/**
 * データベースモックを作成する
 */
export function createMockDatabase(): Database {
	// @ts-ignore - 型を簡略化するためにignoreを使用
	return {
		getOne: vi.fn().mockResolvedValue({
			success: true,
			data: {
				gymId: "gym1",
				name: "Test Gym",
				timezone: "Asia/Tokyo",
				ownerEmail: "owner@example.com",
				plan: "basic",
				createdAt: "2023-01-01T00:00:00Z",
				updatedAt: "2023-01-01T00:00:00Z",
			},
		}),
		list: vi.fn().mockResolvedValue({
			success: true,
			data: [
				{
					gymId: "gym1",
					name: "Test Gym",
					timezone: "Asia/Tokyo",
					ownerEmail: "owner@example.com",
					plan: "basic",
					createdAt: "2023-01-01T00:00:00Z",
					updatedAt: "2023-01-01T00:00:00Z",
				},
			],
		}),
		create: vi.fn().mockResolvedValue({ success: true, id: "new-id" }),
		update: vi.fn().mockResolvedValue({ success: true }),
		delete: vi.fn().mockResolvedValue({ success: true }),
		bookClass: vi.fn().mockResolvedValue({ success: true, bookingId: "booking1" }),
		getClient: vi.fn().mockReturnValue({
			execute: vi.fn().mockResolvedValue([]),
		}),
	};
}

/**
 * データベースクライアントモックを作成する
 */
export function createMockDatabaseClient() {
	// @ts-ignore - 型を簡略化するためにignoreを使用
	return {
		getOne: vi.fn().mockImplementation((table, id) => {
			if (table === "gyms" && id === "gym1") {
				return Promise.resolve({
					success: true,
					data: {
						gymId: "gym1",
						name: "Test Gym",
						timezone: "Asia/Tokyo",
						ownerEmail: "owner@example.com",
						plan: "basic",
						createdAt: "2023-01-01T00:00:00Z",
						updatedAt: "2023-01-01T00:00:00Z",
					},
				});
			}
			return Promise.resolve({ success: false, error: "Not found" });
		}),
		list: vi.fn().mockResolvedValue({
			success: true,
			data: [
				{
					gymId: "gym1",
					name: "Test Gym",
					timezone: "Asia/Tokyo",
					ownerEmail: "owner@example.com",
					plan: "basic",
					createdAt: "2023-01-01T00:00:00Z",
					updatedAt: "2023-01-01T00:00:00Z",
				},
			],
		}),
		create: vi.fn().mockResolvedValue({ success: true, id: "new-id" }),
		update: vi.fn().mockResolvedValue({ success: true }),
		delete: vi.fn().mockResolvedValue({ success: true }),
		query: vi.fn().mockResolvedValue({ success: true, data: [] }),
		queryOne: vi.fn().mockResolvedValue({ success: false, error: "Not supported" }),
		queryMany: vi.fn().mockResolvedValue({ success: false, error: "Not supported" }),
		transaction: vi.fn().mockResolvedValue({ success: false, error: "Not supported" }),
	};
}

/**
 * 認証ミドルウェアテスト用のコンテキストとリクエストオブジェクトをモック
 * @param options モック設定オプション
 * @returns モックコンテキスト、nextミドルウェア、内部変数
 */
export function createMockAuthContext(
	options: {
		headers?: Record<string, string>;
		env?: Partial<Env>;
		adminUser?: AdminAccountType | null;
		url?: string;
		method?: string;
	} = {},
) {
	const {
		headers = {},
		env = {},
		adminUser = null,
		url = "https://example.com/api/test",
		method = "GET",
	} = options;

	// 環境変数のデフォルト値
	const mockEnv = {
		NODE_ENV: "development",
		JWT_SECRET: "test-secret-key",
		SKIP_AUTH: "false",
		DB: {} as D1Database,
		...env,
	} as Env;

	// 内部状態を保持するための変数
	const variables: Partial<AppContext> = {
		requestId: "test-request-id",
		requestTime: Date.now(),
	};

	if (adminUser) {
		variables.admin = adminUser;
	}

	// レスポンスの保持用
	let responseBody: unknown = null;
	let responseStatus = 200;

	// モックコンテキスト
	const mockContext = {
		req: {
			header: (name: string) => headers[name] || null,
			headers: new Headers(headers),
			method,
			url,
		},
		env: mockEnv,
		get: vi.fn((key: keyof AppContext) => variables[key]),
		set: vi.fn((key: keyof AppContext, value: unknown) => {
			variables[key] = value;
		}),
		json: vi.fn((body: unknown, status = 200) => {
			responseBody = body;
			responseStatus = status;
			return new Response(JSON.stringify(body), { status });
		}),
		// 返却されたレスポンスを取得するためのヘルパーメソッド
		getResponse: () => ({
			status: responseStatus,
			body: responseBody,
		}),
	} as unknown as Context<{ Bindings: Env; Variables: AppContext }>;

	// nextミドルウェアの呼び出しをモック
	const mockNext: Next = vi.fn(async () => new Response("OK"));

	return { c: mockContext, next: mockNext, variables };
}

/**
 * 認証ヘッダー付きのリクエストオプションを生成
 * @param adminId 管理者ID（オプション）
 * @param role 管理者ロール（オプション）
 * @returns 認証ヘッダー付きのリクエストオプション
 */
export function createAuthRequestOptions(adminId?: string, role: "admin" | "staff" = "admin") {
	const token = createMockJwtToken({
		adminId,
		role,
	});

	return {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};
}

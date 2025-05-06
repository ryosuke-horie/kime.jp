// Cloudflareバインディングのための環境変数型定義
// TODO: 適切な型定義パッケージをインストールする (@cloudflare/workers-types)

// Cloudflare WorkersのD1データベース型
export interface D1Database {
	prepare: (query: string) => D1PreparedStatement;
	dump: () => Promise<ArrayBuffer>;
	batch: (statements: D1PreparedStatement[]) => Promise<D1Result<unknown>[]>;
	exec: (query: string) => Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
	bind: (...values: unknown[]) => D1PreparedStatement;
	first: <T = unknown>(column?: string) => Promise<T | null>;
	run: <T = unknown>() => Promise<D1Result<T>>;
	all: <T = unknown>() => Promise<D1Result<T>>;
	raw: <T = unknown>() => Promise<T[]>;
}

export interface D1Result<T> {
	results?: T[];
	success: boolean;
	error?: string;
	meta?: object;
}

export interface D1ExecResult {
	count: number;
	duration: number;
}

// Cloudflare WorkersのDurable Object名前空間型
export interface DurableObjectNamespace {
	idFromName: (name: string) => DurableObjectId;
	idFromString: (id: string) => DurableObjectId;
	newUniqueId: () => DurableObjectId;
	jurisdiction: (jurisdiction: string) => {
		get: (id: DurableObjectId) => DurableObject;
	};
	get: (id: DurableObjectId) => DurableObject;
}

export interface DurableObjectId {
	toString: () => string;
}

export interface DurableObject {
	fetch: (request: Request) => Promise<Response>;
}

// 環境変数型定義
export interface Env {
	// D1データベース
	DB: D1Database;

	// Durable Object名前空間
	DB_DO: DurableObjectNamespace;
	CLASS_LOCKER: DurableObjectNamespace;

	// 認証関連の環境変数
	JWT_SECRET?: string;
	NODE_ENV?: string;
	SKIP_AUTH?: string;
}

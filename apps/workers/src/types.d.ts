// Cloudflare Workers および Durable Objects の型定義

// D1 Database
interface D1Database {
	prepare(query: string): D1PreparedStatement;
	dump(): Promise<ArrayBuffer>;
	batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
	exec<T = unknown>(query: string): Promise<D1Result<T>>;
}

interface D1PreparedStatement {
	bind(...values: any[]): D1PreparedStatement;
	first<T = unknown>(colName?: string): Promise<T | null>;
	run<T = unknown>(): Promise<D1Result<T>>;
	all<T = unknown>(): Promise<D1Result<T>>;
	raw<T = unknown>(): Promise<T[]>;
}

interface D1Result<T = unknown> {
	results?: T[];
	success: boolean;
	error?: string;
	meta: {
		changes?: number;
		duration: number;
		last_row_id?: number;
		changed_db?: boolean;
		size_after?: number;
	};
}

// Durable Objects 
interface DurableObjectNamespace {
	newUniqueId(options?: { jurisdiction?: string }): DurableObjectId;
	idFromName(name: string): DurableObjectId;
	idFromString(id: string): DurableObjectId;
	get(id: DurableObjectId): DurableObject;
}

interface DurableObjectId {
	toString(): string;
	equals(other: DurableObjectId): boolean;
}

interface DurableObject {
	fetch(request: Request): Promise<Response>;
}

interface DurableObjectState {
	id: DurableObjectId;
	storage: DurableObjectStorage;
	blockConcurrencyWhile<T>(callback: () => Promise<T> | T): Promise<T>;
	acceptWebSocket(ws: WebSocket): void;
	getWebSockets(): WebSocket[];
}

interface DurableObjectStorage {
	get<T = unknown>(key: string): Promise<T | undefined>;
	get<T = unknown>(keys: string[]): Promise<Map<string, T>>;
	list<T = unknown>(options?: {
		start?: string;
		end?: string;
		prefix?: string;
		reverse?: boolean;
		limit?: number;
	}): Promise<Map<string, T>>;
	put<T>(key: string, value: T): Promise<void>;
	put<T>(entries: Record<string, T>): Promise<void>;
	delete(key: string): Promise<boolean>;
	delete(keys: string[]): Promise<number>;
	deleteAll(): Promise<void>;
	transaction<T>(closure: (txn: DurableObjectTransaction) => Promise<T>): Promise<T>;
}

interface DurableObjectTransaction {
	get<T = unknown>(key: string): Promise<T | undefined>;
	get<T = unknown>(keys: string[]): Promise<Map<string, T>>;
	list<T = unknown>(options?: {
		start?: string;
		end?: string;
		prefix?: string;
		reverse?: boolean;
		limit?: number;
	}): Promise<Map<string, T>>;
	put<T>(key: string, value: T): void;
	put<T>(entries: Record<string, T>): void;
	delete(key: string): void;
	delete(keys: string[]): void;
	rollback(): void;
}
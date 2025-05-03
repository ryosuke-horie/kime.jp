// Cloudflareバインディングのための環境変数型定義
export interface Env {
	// D1 Database
	DB: D1Database;

	// Durable Objects
	DB_DO: DurableObjectNamespace;
	CLASS_LOCKER: DurableObjectNamespace;

	// Secrets (future use)
	// LINE_BOT_TOKEN?: string;
	// STRIPE_SECRET_KEY?: string;
}

// Cloudflareバインディングのための環境変数型定義
// TODO: 適切な型定義パッケージをインストールする (@cloudflare/workers-types)
export interface Env {
	// D1データベース
	DB: any; // D1Database

	// Durable Object名前空間
	DB_DO: any; // DurableObjectNamespace
	CLASS_LOCKER: any; // DurableObjectNamespace
}

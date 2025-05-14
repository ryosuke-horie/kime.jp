// Cloudflare:testモジュールの型定義
declare module "cloudflare:test" {
	export const env: {
		DB?: D1Database;
		NODE_ENV?: string;
		SKIP_AUTH?: string;
		JWT_SECRET?: string;
	};
}

// @opennextjs/cloudflareの代わりに直接設定オブジェクトを作成
// CloudflareConfig型を定義
type CloudflareConfig = {
	incrementalCache?: unknown;
	[key: string]: unknown;
};

// 設定オブジェクトを作成
const config: CloudflareConfig = {
	// Uncomment to enable R2 cache,
	// It should be imported as:
	// `import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";`
	// See https://opennext.js.org/cloudflare/caching for more details
	// incrementalCache: r2IncrementalCache,
};

export default config;

/**
 * 共通設定を定義するヘルパー関数
 * @param config ユーザー設定
 * @returns マージされた設定オブジェクト
 */
export const defineSharedConfig = (config: any) => {
	// Vitestの設定をマージする
	return {
		test: {
			globals: true,
			include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
			exclude: ["**/node_modules/**", "**/dist/**"],
			coverage: {
				provider: "v8",
				reporter: ["text", "json", "html"],
				exclude: ["**/node_modules/**", "**/test/**"],
			},
			outputFile: {
				json: "./test-results.json",
			},
			...(config.test || {})
		},
		...config,
	};
};

// Cloudflare Workers向けの設定プリセット
export const cloudflarePreset = {
	pool: "@cloudflare/vitest-pool-workers",
	poolOptions: {
		workers: {
			wrangler: {
				configPath: "./wrangler.toml",
			},
		},
	},
	environment: "miniflare",
	testTimeout: 10000,
	hookTimeout: 10000,
};

// Reactアプリケーション向けの設定プリセット
export const reactPreset = {
	environment: "happy-dom",
	setupFiles: ["./src/test/setup.ts"],
};

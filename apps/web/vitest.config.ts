import { resolve } from "node:path";
// defineConfigを使わない方法でconfig作成

export default {
	// テストのみの設定なので、pluginsは使用しない
	// plugins: [react()],
	// PostCSSの設定を回避
	css: {
		postcss: {
			plugins: [],
		},
	},
	resolve: {
		// テストで使用するエイリアスを設定
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	test: {
		environment: "happy-dom",
		setupFiles: ["./src/test/setup.ts"],
		include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: ["**/node_modules/**", "**/dist/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			reportsDirectory: "./coverage", // GitHub Actionsで認識されるパスに統一
			exclude: ["**/node_modules/**", "**/test/**"],
		},
		globals: true,
		// キャッシュの有効化
		cache: {
			dir: ".vitest-cache",
		},
		// 高速失敗を有効化
		bail: 1,
	},
};

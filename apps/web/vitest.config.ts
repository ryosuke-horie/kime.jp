import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
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
		// Vitest 3.1.2ではwatchExcludeからwatchIgnoreに変更された
		// https://github.com/vitest-dev/vitest/releases/tag/v0.34.0
		watchIgnore: ["**/node_modules/**", "**/dist/**"],
		// キャッシュの有効化
		cache: {
			dir: ".vitest-cache",
		},
		// 高速失敗を有効化
		bail: 1,
	},
});

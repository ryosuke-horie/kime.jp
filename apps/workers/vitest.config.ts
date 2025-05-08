import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		testTimeout: 10000,
		hookTimeout: 10000,
		include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: ["**/node_modules/**", "**/dist/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			reportsDirectory: "./coverage",
			exclude: ["**/node_modules/**", "**/test/**"],
		},
		globals: true,
		// @ts-expect-error: Vitest 3.1.2ではwatchExcludeからwatchIgnoreに変更されたが型定義にまだ反映されていない
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

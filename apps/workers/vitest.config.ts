import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// 通常のNode.js環境でテストを実行
		// Workers プールは現時点では連携に問題があるため
		// pool: "@cloudflare/vitest-pool-workers",
		// poolOptions: {
		// 	workers: {
		// 		wrangler: {
		// 			configPath: "./wrangler.toml",
		// 		},
		// 	},
		// },
		testTimeout: 10000,
		hookTimeout: 10000,
		setupFiles: ["./src/test/setup.ts"],
		include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: ["**/node_modules/**", "**/dist/**"],
		// カバレッジ設定 - 現時点ではVitest 1.6.1とプロバイダーの互換性に問題がある
		// coverage: {
		// 	provider: "istanbul",
		// 	reporter: ["text", "json", "html"],
		// 	exclude: ["**/node_modules/**", "**/test/**"],
		// },
		globals: true,
	},
});
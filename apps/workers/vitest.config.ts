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
		// Vitest 3.1.2で互換性問題が解決されたため有効化
		coverage: {
			provider: "v8", // v8プロバイダーに変更して統一
			reporter: ["text", "json", "html"],
			reportsDirectory: "./coverage", // GitHub Actionsで認識されるパスに統一
			exclude: ["**/node_modules/**", "**/test/**"],
		},
		globals: true,
		// ファイル変更を監視する際のパフォーマンス向上
		watchExclude: ["**/node_modules/**", "**/dist/**"],
		// キャッシュの有効化
		cache: {
			dir: ".vitest-cache",
		},
		// 高速失敗を有効化
		bail: 1,
	},
});

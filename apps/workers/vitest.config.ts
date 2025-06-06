import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import path from "path";

export default defineWorkersConfig({
	test: {
		testTimeout: 10000,
		hookTimeout: 10000,
		include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}"],
		exclude: ["**/node_modules/**", "**/dist/**"],
		coverage: {
			provider: "istanbul",
			reporter: ["text", "json", "json-summary", "html"],
			reportsDirectory: "./coverage",
			exclude: ["**/node_modules/**", "**/test/**", "**/db/**", "**/vite.config.ts"],
		},
		globals: true,
		// @ts-expect-error: Vitest 3.1.2ではwatchExcludeからwatchIgnoreに変更されたが型定義にまだ反映されていない
		// https://github.com/vitest-dev/vitest/releases/tag/v0.34.0
		watchIgnore: ["**/node_modules/**", "**/dist/**"],
		// キャッシュの有効化
		// 非推奨のcache.dirからcacheDirへ変更
		// Vitestは cacheDir/vitest に自動的にキャッシュを保存します
		cacheDir: ".vitest-cache",
		// 高速失敗を有効化
		bail: 1,
		
		// 環境変数の設定 - テスト環境であることを明示
		env: {
			NODE_ENV: "test",
			SKIP_AUTH: "true",
			JWT_SECRET: "test-secret-key-ci",
		},
		
		// Cloudflare Workers環境では不要なSSRの依存関係解決警告を抑制
		// @cloudflare/vitest-pool-workersが自動的にchaiをSSR optimizeDepsに追加するが、
		// workers環境ではSSRは使用しないため、この設定で警告を抑制
		deps: {
			optimizer: {
				ssr: {
					// SSRの依存関係最適化を無効化（Cloudflare Workers では不要）
					enabled: false,
				},
			},
		},
		
		// Cloudflare Workers の統合テスト設定
		// 単体テストのみを実行する場合は以下の設定をコメントアウトし、
		// environment: 'node' を追加
		poolOptions: {
			workers: {
				// テスト専用のWrangler設定ファイルのパス
				wrangler: {
					configPath: './wrangler.test.toml',
				},
				// D1データベースの設定
				d1Persist: false, // テスト間でデータを永続化しない
				d1Databases: ['DB'],
				// 分離されたストレージパスを指定
				persistTo: './.wrangler/test-state',
				// D1データベースの自動クリーンアップ
				d1AutoReset: true,
			},
		},
		
		// テスト前に実行するセットアップファイル
		setupFiles: ["./src/test/setup.ts"],
	},
});

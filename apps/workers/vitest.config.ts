import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import path from "path";

export default defineWorkersConfig({
	test: {
		testTimeout: 10000,
		hookTimeout: 10000,
		include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}"],
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
		
		// Cloudflare Workers の統合テスト設定
		// 単体テストのみを実行する場合は以下の設定をコメントアウトし、
		// environment: 'node' を追加
		poolOptions: {
			workers: {
				// Wrangler設定ファイルのパス
				wrangler: {
					configPath: './wrangler.toml',
				},
				// D1データベースの設定
				d1Persist: false, // テスト間でデータを永続化しない
				d1Databases: ['DB'],
				// 代替の方法: マイグレーションファイルは使用せず、
				// apply-migrations.ts内でテーブルを直接作成する
			},
		},
		
		// テスト前に実行するセットアップファイル
		setupFiles: ["./src/test/apply-migrations.ts"],
	},
});

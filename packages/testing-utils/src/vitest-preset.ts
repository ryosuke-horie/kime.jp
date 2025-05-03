import { mergeConfig } from "vitest/config";
import type { UserConfig } from "vitest/config";

export const defineSharedConfig = (config: UserConfig) => {
	return mergeConfig(
		{
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
			},
		},
		config,
	);
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
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths(), react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		pool: "forks",
		poolOptions: {
			forks: {
				isolate: false,
			},
		},
		environmentOptions: {
			jsdom: {
				url: "http://localhost:3000",
				pretendToBeVisual: true,
				resources: "usable",
			},
		},
		env: {
			NODE_OPTIONS: "--experimental-global-webcrypto",
		},

		// カバレッジ設定
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			exclude: ["coverage/**", "dist/**", "**/*.d.ts", "**/.next/**", "**/vitest.config.{js,ts}"],
			thresholds: {
				global: {
					branches: 80,
					functions: 80,
					lines: 80,
					statements: 80,
				},
			},
		},
	},
});

import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
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
			exclude: ["**/node_modules/**", "**/test/**"],
		},
		globals: true,
	},
});

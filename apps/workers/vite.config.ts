import { resolve } from "node:path";
import build from "@hono/vite-build/cloudflare-workers";
import { type ConfigEnv, defineConfig } from "vite";

export default defineConfig((env: ConfigEnv) => {
	const commonConfig = {
		resolve: {
			alias: {
				"@kime/db": resolve(__dirname, "./src/db/index.ts"),
			},
		},
	};

	// API サーバービルド設定
	return {
		...commonConfig,
		plugins: [build({ outputDir: "dist-server" })],
		build: {
			rollupOptions: {
				input: "./src/index.ts", // wrangler.tomlと一致させる
			},
		},
	};
});
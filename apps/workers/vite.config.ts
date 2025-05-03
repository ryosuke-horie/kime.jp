import { resolve } from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import build from "@hono/vite-build/cloudflare-workers";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
	const commonConfig = {
		resolve: {
			alias: {
				"@kime/db": resolve(__dirname, "../../packages/db/src/index.ts"),
			},
		},
	};

	if (command === "serve") {
		return {
			...commonConfig,
			plugins: [cloudflare()],
		};
	}

	// For API server only - no SSR
	return {
		...commonConfig,
		plugins: [build({ outputDir: "dist-server" })],
		build: {
			ssr: true, // Build for SSR even though we're not really doing SSR
			rollupOptions: {
				input: "src/index.tsx", // Specify our entry point explicitly
			},
		},
	};
});

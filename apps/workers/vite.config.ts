import { cloudflare } from "@cloudflare/vite-plugin";
import build from "@hono/vite-build/cloudflare-workers";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
	if (command === "serve") {
		return { plugins: [cloudflare()] };
	}

	// For API server only - no SSR
	return {
		plugins: [build({ outputDir: "dist-server" })],
		build: {
			ssr: true, // Build for SSR even though we're not really doing SSR
			rollupOptions: {
				input: "src/index.tsx", // Specify our entry point explicitly
			},
		},
	};
});

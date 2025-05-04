import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts", "src/common.ts", "src/gym.ts", "src/health.ts"],
	format: ["esm"],
	dts: true,
	clean: true,
});

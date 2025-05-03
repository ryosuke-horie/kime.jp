// lint-staged.config.js
module.exports = {
	// Biomeでの整形とリント（すべてのJavaScript/TypeScriptファイル）
	"**/*.{js,jsx,ts,tsx}": [
		"pnpm biome check --write",
		"pnpm biome lint --apply",
	],
	// JSON, YAML, MDファイル
	"**/*.{json,yaml,yml,md}": ["pnpm biome check --write"],
};

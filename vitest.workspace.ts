import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
	// Glob パターンでプロジェクトを指定
	"apps/*/vitest.config.{js,ts}",
]);

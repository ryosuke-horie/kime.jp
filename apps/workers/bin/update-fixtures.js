#!/usr/bin/env node

/**
 * テストフィクスチャを自動更新するスクリプト
 * マイグレーション後に実行することで、スキーマ変更をテストフィクスチャに反映する
 */
const { spawn } = require("node:child_process");
const path = require("node:path");

// Viteアプリのルートディレクトリを取得
const appRoot = path.resolve(__dirname, "..");

// migration-helper.tsを実行するためのViteコマンド
const command = "node";
const args = [
	"-e",
	`import('${appRoot}/src/test/migration-helper.ts').then(m => m.updateFixturesAfterMigration())`,
	"--loader",
	"ts-node/esm",
];

console.log("テストフィクスチャの自動更新を開始します...");

// スクリプトを実行
const childProcess = spawn(command, args, {
	stdio: "inherit",
	shell: true,
	env: {
		...process.env,
		NODE_ENV: "development",
	},
});

childProcess.on("close", (code) => {
	if (code === 0) {
		console.log("テストフィクスチャの自動更新が完了しました。");
	} else {
		console.error(`テストフィクスチャの自動更新に失敗しました。終了コード: ${code}`);
	}
});

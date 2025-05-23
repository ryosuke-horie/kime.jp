/**
 * テスト環境の自動セットアップスクリプト
 * - Wranglerのテスト環境設定
 * - D1データベースの準備
 * - マイグレーションとシードデータ
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ESモジュールで__dirnameの代わりに使用するディレクトリパスを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 現在のファイルの絶対ディレクトリパス
const PROJECT_DIR = path.resolve(__dirname, "../../");

// 色付きコンソール出力のためのユーティリティ
const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
};

/**
 * カラーメッセージをコンソールに出力
 */
function log(message: string, color: keyof typeof colors = "reset"): void {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * エラーメッセージをコンソールに出力
 */
function error(message: string): void {
	console.error(`${colors.red}ERROR: ${message}${colors.reset}`);
}

/**
 * テスト環境がセットアップされているかチェック
 */
function isTestEnvSetup(): boolean {
	// wrangler.test.tomlが存在するかチェック
	const configPath = path.resolve(PROJECT_DIR, "wrangler.test.toml");
	if (!fs.existsSync(configPath)) {
		error(`テスト設定ファイルが見つかりません: ${configPath}`);
		return false;
	}

	// .wrangler/test-stateディレクトリが存在するかチェック
	const testStatePath = path.resolve(PROJECT_DIR, ".wrangler/test-state");
	if (!fs.existsSync(testStatePath)) {
		log(`テスト状態ディレクトリが見つかりません: ${testStatePath}`, "yellow");
		log("新しいテスト環境を作成します...", "blue");
		fs.mkdirSync(testStatePath, { recursive: true });
	}

	return true;
}

/**
 * wrangler.test.tomlの設定を検証
 */
function validateTestConfig(): boolean {
	try {
		const configPath = path.resolve(PROJECT_DIR, "wrangler.test.toml");
		const config = fs.readFileSync(configPath, "utf-8");

		// テスト環境に必要な設定が含まれているか確認
		if (!config.includes("kime_mvp_test")) {
			error("wrangler.test.tomlにテスト用D1データベース設定が不足しています");
			return false;
		}

		if (!config.includes('NODE_ENV = "test"')) {
			log('wrangler.test.tomlにNODE_ENV = "test"設定が見つかりません', "yellow");
		}

		return true;
	} catch (err) {
		error(`テスト設定ファイルの読み込みに失敗しました: ${err}`);
		return false;
	}
}

/**
 * テスト用D1データベースを準備
 */
function setupTestDatabase(): boolean {
	try {
		log("テスト用D1データベースを準備しています...", "blue");

		// wrangler.test.tomlを使ってD1データベースを初期化
		execSync(
			"npx wrangler d1 execute kime_mvp_test --local --config=wrangler.test.toml --command='SELECT 1'",
			{
				stdio: "inherit",
				cwd: PROJECT_DIR,
			},
		);

		log("✅ テスト用D1データベースが正常に初期化されました", "green");
		
		// マイグレーションを適用
		log("マイグレーションを適用しています...", "blue");
		
		// テスト実行時にマイグレーションランナーを使用
		// 注：このスクリプトはNode.js環境で実行されるため、
		// Vitestのテスト実行時にマイグレーションが適用されるようにする
		log("ℹ️  マイグレーションはテスト実行時に自動的に適用されます", "cyan");
		
		return true;
	} catch (err) {
		error(`テスト用D1データベースの初期化に失敗しました: ${err}`);

		// D1データベースの作成を試みる
		try {
			log("テスト用D1データベースを作成しています...", "yellow");
			execSync("npx wrangler d1 create kime_mvp_test --local --config=wrangler.test.toml", {
				stdio: "inherit",
				cwd: PROJECT_DIR,
			});
			log("✅ テスト用D1データベースが作成されました", "green");
			return true;
		} catch (createErr) {
			error(`テスト用D1データベースの作成に失敗しました: ${createErr}`);
			return false;
		}
	}
}

/**
 * テスト環境のセットアップを実行
 */
function setupTestEnvironment(): void {
	log("テスト環境のセットアップを開始します...", "cyan");

	// 前提条件の確認
	if (!isTestEnvSetup() || !validateTestConfig()) {
		error("テスト環境のセットアップに必要な条件が満たされていません");
		process.exit(1);
	}

	// テスト用D1データベースのセットアップ
	if (!setupTestDatabase()) {
		error("テスト用D1データベースのセットアップに失敗しました");
		process.exit(1);
	}

	log("🎉 テスト環境のセットアップが完了しました!", "green");
	log("テストの実行方法:", "cyan");
	log("  pnpm test         # すべてのテストを実行", "yellow");
	log("  pnpm test:watch   # 変更を監視しながらテストを実行", "yellow");
	log("  pnpm test:clean   # テスト環境をクリーンアップして再セットアップ", "yellow");
}

// ESモジュールで直接実行された場合にセットアップを実行
// import.meta.url === 'file://...' で直接実行判断
if (import.meta.url.startsWith("file:")) {
	setupTestEnvironment();
}

export { setupTestEnvironment };

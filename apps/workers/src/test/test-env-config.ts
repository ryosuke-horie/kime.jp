/**
 * テスト環境の統一設定
 * 環境変数を一元管理し、重複を排除
 */

export const TEST_ENV_CONFIG = {
	// テスト環境識別
	NODE_ENV: "test",
	
	// 認証設定
	SKIP_AUTH: "true",
	JWT_SECRET: "test-secret-key",
	
	// D1データベース設定
	DB_NAME: "kime_mvp_test",
	DB_BINDING: "DB",
	
	// Wrangler設定
	DEV_PORT: 8787,
	DEV_PROTOCOL: "http",
	
	// Vitest設定
	TEST_TIMEOUT: 10000,
	HOOK_TIMEOUT: 10000,
} as const;

/**
 * テスト環境変数を取得
 */
export function getTestEnvVars() {
	return {
		NODE_ENV: TEST_ENV_CONFIG.NODE_ENV,
		SKIP_AUTH: TEST_ENV_CONFIG.SKIP_AUTH,
		JWT_SECRET: TEST_ENV_CONFIG.JWT_SECRET,
	};
}

/**
 * Wrangler設定を取得
 */
export function getWranglerConfig() {
	return {
		name: "kime-workers-test",
		compatibility_date: "2024-04-01",
		main: "./src/index.ts",
		d1_databases: [{
			binding: TEST_ENV_CONFIG.DB_BINDING,
			database_name: TEST_ENV_CONFIG.DB_NAME,
			database_id: "test_db",
		}],
		vars: getTestEnvVars(),
		dev: {
			port: TEST_ENV_CONFIG.DEV_PORT,
			local_protocol: TEST_ENV_CONFIG.DEV_PROTOCOL,
		},
	};
}

/**
 * Vitest設定を取得
 */
export function getVitestConfig() {
	return {
		test: {
			testTimeout: TEST_ENV_CONFIG.TEST_TIMEOUT,
			hookTimeout: TEST_ENV_CONFIG.HOOK_TIMEOUT,
			env: getTestEnvVars(),
			poolOptions: {
				workers: {
					wrangler: {
						configPath: './wrangler.test.toml',
					},
					d1Persist: false,
					d1Databases: [TEST_ENV_CONFIG.DB_BINDING],
					d1AutoReset: true,
				},
			},
		},
	};
}
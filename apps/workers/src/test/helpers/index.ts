/**
 * テストモックデータとスキーマの同期メカニズム
 *
 * このモジュールは、スキーマ変更時にテストデータが自動的に同期される
 * 仕組みを提供し、型安全なテストデータ生成機能を提供します。
 */

// スキーマ型抽出
export {
	extractSchemaTypes,
	getTableNames,
	validateTableSchema,
	getTableSchema,
	type SchemaTypeMap,
	type TableName,
} from "./schema-type-extractor";

// 型安全なフィクスチャ生成
export {
	createFixture,
	createMultipleFixtures,
	createGymFixture,
	createMemberFixture,
	createClassFixture,
	createBookingFixture,
	createCheckinFixture,
	createStaffFixture,
	createClassStaffFixture,
	createShiftFixture,
	createAdminAccountFixture,
	validateFixtureData,
	type FixtureOptions,
} from "./fixture-generator";

// スキーマ検証
export {
	validateSchemaConsistency,
	checkFieldCompatibility,
	detectSchemaMismatch,
	generateSchemaReport,
	type SchemaValidationResult,
	type FieldMismatch,
	type TableValidationReport,
	type SchemaReport,
} from "./schema-validation";

// マイグレーション同期
export {
	syncFixturesWithMigration,
	detectMigrationChanges,
	transformFixtureData,
	backupFixtures,
	restoreFixtures,
	generateMigrationScript,
	validateMigrationChanges,
	type MigrationChange,
	type FixtureTransformation,
	type SchemaDefinition,
	type MigrationOptions,
} from "./migration-sync";

// フィクスチャファイル
export {
	gymFixtures,
	generateGymFixtures,
	createCustomGymFixtures,
	seedGymData,
	seedCustomGymData,
	seedGymDataFromBindings,
	legacyGymFixtures,
} from "../fixtures/gym-fixtures";

export {
	memberFixtures,
	generateMemberFixturesForGym,
	createCustomMemberFixtures,
	seedMemberData,
	seedCustomMemberData,
} from "../fixtures/member-fixtures";

// ユーティリティ関数
export {
	getTestEnv,
	createTestApp,
	createTestBindings,
	createTestDb,
	checkEnvironment,
	setupD1Test,
	cleanupD1Test,
	createTestRequest,
	isD1Available,
	itWithD1,
	describeWithD1,
} from "./test-utils";

/**
 * 型安全なテストデータセットアップのヘルパー関数
 */
export async function setupTypeSafeTestData(
	db: D1Database,
	options?: {
		gymCount?: number;
		memberCount?: number;
		includeClasses?: boolean;
		includeBookings?: boolean;
	},
): Promise<{
	gyms: ReturnType<typeof createGymFixture>[];
	members: ReturnType<typeof createMemberFixture>[];
}> {
	const { gymCount = 3, memberCount = 5 } = options || {};

	const generatedGyms = Array.from({ length: gymCount }, () => createGymFixture());
	const generatedMembers = Array.from({ length: memberCount }, (_, index) =>
		createMemberFixture({
			gymId: generatedGyms[index % generatedGyms.length].gymId,
		}),
	);

	// DB投入は実際のテストで実行
	return {
		gyms: generatedGyms,
		members: generatedMembers,
	};
}

/**
 * スキーマ同期の完全なワークフローを実行するヘルパー関数
 */
export async function performSchemaSync(
	oldSchemaPath: string,
	newSchemaPath: string,
	currentFixtures: Record<string, any[]>,
	options?: {
		createBackup?: boolean;
		validateAfterSync?: boolean;
	},
): Promise<{
	updatedFixtures: Record<string, any[]>;
	migrationChanges: ReturnType<typeof detectMigrationChanges>;
	validationReport: ReturnType<typeof generateSchemaReport>;
	backupPath?: string;
}> {
	const { createBackup = true, validateAfterSync = true } = options || {};

	// バックアップ作成
	let backupPath: string | undefined;
	if (createBackup) {
		backupPath = await backupFixtures(currentFixtures);
	}

	// TODO: 実際の実装では、スキーマファイルを読み込んで変更を検出
	// ここではプレースホルダー
	const migrationChanges: ReturnType<typeof detectMigrationChanges> = [];

	// フィクスチャ同期
	const updatedFixtures = await syncFixturesWithMigration(currentFixtures, migrationChanges);

	// 検証レポート生成
	let validationReport: ReturnType<typeof generateSchemaReport>;
	if (validateAfterSync) {
		validationReport = generateSchemaReport(updatedFixtures);
	} else {
		validationReport = {
			summary: { totalTables: 0, validTables: 0, invalidTables: 0, totalFixtures: 0 },
			tableReports: {},
		};
	}

	return {
		updatedFixtures,
		migrationChanges,
		validationReport,
		backupPath,
	};
}

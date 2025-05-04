// テスト環境セットアップ
// vitestのglobalsを使用するため、明示的なインポートは不要

// テスト前の共通処理
beforeAll(() => {
	console.log("Web test setup initialized");
});

// テスト後のクリーンアップ
afterAll(() => {
	console.log("Web test cleanup complete");
});

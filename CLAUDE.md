# CLAUDE.md

## 言語設定
- 基本的に日本語で応答してください
- コードやコマンドの説明も日本語で行ってください

## 重要

### テスト駆動開発を行う
TDDを実施する。コードを生成するときにはそれに対応するユニットテストを常に生成する。
コードを追加で修正したときには`npm run test`がパスすることを常に確認する。

```ts
function add(a: number, b: number) { return a + b }
test("1+2=3", () => {
  expect(add(1, 2)).toBe(3);
});
```

### vitest で実装と同じファイルにユニットテストを書く。
出力例
```ts
export function distance(a: Point, b: Point): number {...}
if (import.meta.vitest) {
  const {test, expect} = import.meta.vitest;
  test("ユークリッド距離を計算する", () => {
    const result = distance({x: 0, y: 0}, {x: 3, y: 4});
    expect(distance(result)).toBe(5)
  });
}
```

### 各ファイルの冒頭にはコメントで仕様を記述する

出力例

```ts
/**
 * 2点間のユークリッド距離を計算する
**/
type Point = { x: number; y: number; };
export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
```

## コーディングガイドライン
- Biomeによるフォーマット/リントを適用します。
- anyの使用を禁止し、型推論が効くように実装を進めていきます。
- apps/workers以下はViteを採用しTDDを採用します。
- テストコードは実装のすぐ近くの**.test.tsの形式で記述します。

## コマンド
- pnpm test ... テストコードの実施
- pnpm format ... BiomeによるLint
- pnpm typecheck ... tscによる型チェック
- gh ... GitHub CLIでIssueやPRの作成・閲覧に使用

## プロジェクト構造
- Turborepo と pnpm で管理されたモノレポ構成
- アプリ:
  - `web`: NextjsとShadcn/uiを利用して構築するフロントエンド
  - `workers`: Hono フレームワークを使用した Cloudflare Workers API
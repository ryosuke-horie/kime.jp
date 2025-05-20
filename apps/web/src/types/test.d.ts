// テストファイル用の型定義
declare module "*.test.ts" {
	export {};
}

declare module "*.test.tsx" {
	export {};
}

// vitestのモックもここで宣言
declare namespace Vi {
	function fn(): any;
	function mock(path: string, factory?: any): any;
}

declare global {
	namespace jest {
		interface Matchers<R> {
			toHaveBeenCalled(): R;
			toEqual(expected: any): R;
			toBe(expected: any): R;
			toThrow(expected?: any): R;
		}
	}
}

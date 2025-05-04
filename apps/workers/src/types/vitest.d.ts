// Vitestの型定義
declare module "vitest" {
	export function describe(name: string, fn: () => void): void;
	export function it(name: string, fn: () => void | Promise<void>): void;
	export function test(name: string, fn: () => void | Promise<void>): void;
	export interface ExpectMethods<T> {
		toBe(expected: T): void;
		toEqual(expected: unknown): void;
		toStrictEqual(expected: unknown): void;
		toBeDefined(): void;
		toBeUndefined(): void;
		toBeNull(): void;
		toBeTruthy(): void;
		toBeFalsy(): void;
		toContain(expected: unknown): void;
		toThrow(
			expected?: string | RegExp | Error | ((...args: unknown[]) => unknown),
		): void;
		toThrowError(
			expected?: string | RegExp | Error | ((...args: unknown[]) => unknown),
		): void;
		toHaveBeenCalled(): void;
		toHaveBeenCalledTimes(expected: number): void;
		toHaveBeenCalledWith(...args: unknown[]): void;
		toHaveProperty(property: string, value?: unknown): void;
		toHaveLength(expected: number): void;
		toBeGreaterThan(expected: number): void;
		toBeGreaterThanOrEqual(expected: number): void;
		toBeLessThan(expected: number): void;
		toBeLessThanOrEqual(expected: number): void;
		toBeInstanceOf(expected: new (...args: unknown[]) => unknown): void;
		toMatch(expected: string | RegExp): void;
		toMatchObject(expected: object): void;
		not: ExpectMethods<T>;
	}

	export function expect<T>(value: T): ExpectMethods<T>;
	export function beforeEach(fn: () => void | Promise<void>): void;
	export function afterEach(fn: () => void | Promise<void>): void;
	export function beforeAll(fn: () => void | Promise<void>): void;
	export function afterAll(fn: () => void | Promise<void>): void;
	export interface ViHelper {
		fn<TArgs extends unknown[], TReturn>(
			implementation?: (...args: TArgs) => TReturn,
		): jest.Mock<TReturn, TArgs>;
		spyOn<T extends object, K extends keyof T>(
			object: T,
			method: K,
		): jest.SpyInstance<
			ReturnType<T[K] extends (...args: unknown[]) => unknown ? T[K] : never>,
			Parameters<T[K] extends (...args: unknown[]) => unknown ? T[K] : never>
		>;
		mock<T extends string>(path: T, factory?: () => unknown): void;
		stubGlobal<T extends keyof typeof globalThis>(
			name: T,
			value: unknown,
		): void;
		restoreAllMocks(): void;
		resetAllMocks(): void;
		clearAllMocks(): void;
	}

	export const vi: ViHelper;
}

declare namespace jest {
	export interface Mock<T = unknown, Y extends unknown[] = unknown[]> {
		(...args: Y): T;
		mockImplementation(fn: (...args: Y) => T): this;
		mockReturnValue(value: T): this;
		mockReturnValueOnce(value: T): this;
		mockResolvedValue(value: T): this;
		mockResolvedValueOnce(value: T): this;
		mockRejectedValue(value: unknown): this;
		mockRejectedValueOnce(value: unknown): this;
		mockClear(): this;
		mockReset(): this;
		mockRestore(): this;
		getMockName(): string;
		mockName(name: string): this;
		mock: {
			calls: Y[];
			instances: T[];
			invocationCallOrder: number[];
			results: Array<{ type: string; value: T }>;
		};
	}

	export interface SpyInstance<T = unknown, Y extends unknown[] = unknown[]>
		extends Mock<T, Y> {
		mockRestore(): void;
	}
}

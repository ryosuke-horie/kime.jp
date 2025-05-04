// Vitestの型定義
declare module "vitest" {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function expect<T>(value: T): {
    toBe(expected: T): void;
    toEqual(expected: any): void;
    toStrictEqual(expected: any): void;
    toBeDefined(): void;
    toBeUndefined(): void;
    toBeNull(): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toContain(expected: any): void;
    toThrow(expected?: any): void;
    toThrowError(expected?: any): void;
    toHaveBeenCalled(): void;
    toHaveBeenCalledTimes(expected: number): void;
    toHaveBeenCalledWith(...args: any[]): void;
    toHaveProperty(property: string, value?: any): void;
    toHaveLength(expected: number): void;
    toBeGreaterThan(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toBeLessThan(expected: number): void;
    toBeLessThanOrEqual(expected: number): void;
    toBeInstanceOf(expected: any): void;
    toMatch(expected: string | RegExp): void;
    toMatchObject(expected: object): void;
    not: any;
  };
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;
  export const vi: {
    fn<T extends (...args: any[]) => any>(implementation?: T): jest.Mock<ReturnType<T>, Parameters<T>>;
    spyOn<T extends object, K extends keyof T>(object: T, method: K): jest.SpyInstance;
    mock<T extends string>(path: T, factory?: () => any): void;
    stubGlobal<T extends keyof typeof globalThis>(name: T, value: any): void;
    restoreAllMocks(): void;
    resetAllMocks(): void;
    clearAllMocks(): void;
  };
}

declare namespace jest {
  export interface Mock<T = any, Y extends any[] = any[]> {
    (...args: Y): T;
    mockImplementation(fn: (...args: Y) => T): this;
    mockReturnValue(value: T): this;
    mockReturnValueOnce(value: T): this;
    mockResolvedValue(value: T): this;
    mockResolvedValueOnce(value: T): this;
    mockRejectedValue(value: any): this;
    mockRejectedValueOnce(value: any): this;
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

  export interface SpyInstance<T = any, Y extends any[] = any[]> extends Mock<T, Y> {
    mockRestore(): void;
  }
}
// React JSX型定義
declare namespace React {
	type ReactNode =
		| string
		| number
		| boolean
		| null
		| undefined
		| ReactElement
		| ReactFragment
		| ReactPortal
		| (() => ReactNode);
	interface ReactElement<
		P = unknown,
		T extends string | JSXElementConstructor<unknown> =
			| string
			| JSXElementConstructor<unknown>,
	> {
		type: T;
		props: P;
		key: Key | null;
	}
	type Key = string | number;
	type ReactFragment = Iterable<ReactNode>;
	interface ReactPortal extends ReactElement {
		key: Key | null;
		children: ReactNode;
	}
	type JSXElementConstructor<P> =
		| ((props: P) => ReactElement<unknown, unknown> | null)
		| (new (
				props: P,
		  ) => Component<unknown, unknown>);
	class Component<P, S> {
		props: Readonly<P>;
		state: Readonly<S>;
		setState(
			state: S | ((prevState: Readonly<S>, props: Readonly<P>) => S | null),
		): void;
		forceUpdate(): void;
		render(): ReactNode;
	}
}

// JSX名前空間
declare namespace JSX {
	interface Element extends React.ReactElement<unknown, unknown> {}
	interface IntrinsicElements {
		// HTML要素の型定義
		[elemName: string]: unknown;
	}
}

// Next.js関連の型定義
declare module "next" {
	export type Metadata = {
		title?: string;
		description?: string;
		[key: string]: unknown;
	};
	export type NextConfig = {
		[key: string]: unknown;
	};
}

// next/font関連の型定義
declare module "next/font/google" {
	export type FontOptions = {
		variable?: string;
		subsets?: string[];
		[key: string]: unknown;
	};
	export function Geist(options: FontOptions): {
		variable: string;
		className: string;
	};
	export function Geist_Mono(options: FontOptions): {
		variable: string;
		className: string;
	};
}

// Vitest関連の型定義
declare module "vitest" {
	export function describe(name: string, fn: () => void): void;
	export function it(name: string, fn: () => void): void;
	export function test(name: string, fn: () => void): void;
	export interface Matcher<R> {
		not: Matcher<R>;
		toBe(expected: unknown): R;
		toEqual(expected: unknown): R;
		// 他のmatcherメソッド
	}
	export function expect<T>(actual: T): Matcher<void>;
	export function beforeAll(fn: () => void): void;
	export function afterAll(fn: () => void): void;
}

// OpenNext Cloudflare関連の型定義
declare module "@opennextjs/cloudflare" {
	export interface CloudflareConfig {
		// Cloudflare設定用の型定義
		[key: string]: unknown;
	}
	export function defineCloudflareConfig(
		config: CloudflareConfig,
	): CloudflareConfig;
	export function initOpenNextCloudflareForDev(): void;
}

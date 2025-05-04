// Viteとプラグインの型定義
declare module "node:path" {
	export function resolve(...paths: string[]): string;
	export function join(...paths: string[]): string;
	export function dirname(path: string): string;
	export function basename(path: string, ext?: string): string;
	export function extname(path: string): string;
	export function isAbsolute(path: string): boolean;
	export function relative(from: string, to: string): string;
	export function parse(path: string): {
		root: string;
		dir: string;
		base: string;
		ext: string;
		name: string;
	};
	export function format(pathObject: {
		root?: string;
		dir?: string;
		base?: string;
		ext?: string;
		name?: string;
	}): string;
}

declare module "vite" {
	export interface ViteConfig {
		plugins?: unknown[];
		build?: {
			outDir?: string;
			minify?: boolean | "terser" | "esbuild";
			lib?: {
				entry?: string | string[] | Record<string, string>;
				formats?: ("es" | "cjs" | "umd" | "iife")[];
				name?: string;
			};
			rollupOptions?: unknown;
			[key: string]: unknown;
		};
		server?: {
			port?: number;
			host?: string;
			[key: string]: unknown;
		};
		[key: string]: unknown;
	}
	export function defineConfig(config: ViteConfig): ViteConfig;
}

declare module "@cloudflare/vite-plugin" {
	export interface CloudflarePluginOptions {
		wrangler?: object;
		entrypoint?: string;
		cfPagesPlugin?: boolean;
	}
	export default function cloudflarePlugin(options?: CloudflarePluginOptions): {
		name: string;
		[key: string]: unknown;
	};
}

declare module "@hono/vite-build/cloudflare-workers" {
	export interface HonoPluginOptions {
		entry?: string;
		outDir?: string;
		minify?: boolean;
		external?: string[];
	}
	export default function honoCloudflareWorkersPlugin(
		options?: HonoPluginOptions,
	): { name: string; [key: string]: unknown };
}

declare module "vitest/config" {
	export interface VitestConfig extends Record<string, unknown> {
		test?: {
			environment?: string;
			globals?: boolean;
			setupFiles?: string[];
			include?: string[];
			exclude?: string[];
			coverage?: {
				provider?: string;
				reporter?: string[] | string;
				[key: string]: unknown;
			};
			[key: string]: unknown;
		};
	}
	export function defineConfig(config: VitestConfig): VitestConfig;
}

// Honoのインポート問題に対応する型定義
declare module "hono" {
	import type { ReadableStream } from "node:stream/web";

	export class Hono<E = unknown, S = unknown, BasePath extends string = ""> {
		route(path: string): Hono<E, S, BasePath>;
		get(
			path: string,
			handler: (c: Context<E, S>) => Response | Promise<Response>,
		): Hono<E, S, BasePath>;
		post(
			path: string,
			handler: (c: Context<E, S>) => Response | Promise<Response>,
		): Hono<E, S, BasePath>;
		put(
			path: string,
			handler: (c: Context<E, S>) => Response | Promise<Response>,
		): Hono<E, S, BasePath>;
		patch(
			path: string,
			handler: (c: Context<E, S>) => Response | Promise<Response>,
		): Hono<E, S, BasePath>;
		delete(
			path: string,
			handler: (c: Context<E, S>) => Response | Promise<Response>,
		): Hono<E, S, BasePath>;
		options(
			path: string,
			handler: (c: Context<E, S>) => Response | Promise<Response>,
		): Hono<E, S, BasePath>;
		head(
			path: string,
			handler: (c: Context<E, S>) => Response | Promise<Response>,
		): Hono<E, S, BasePath>;
		all(
			path: string,
			handler: (c: Context<E, S>) => Response | Promise<Response>,
		): Hono<E, S, BasePath>;
		use(
			path: string,
			middleware: (c: Context<E, S>, next: () => Promise<void>) => Promise<void> | void,
		): Hono<E, S, BasePath>;
		use(
			middleware: (c: Context<E, S>, next: () => Promise<void>) => Promise<void> | void,
		): Hono<E, S, BasePath>;
		onError(
			handler: (err: Error, c: Context<E, S>) => Response | Promise<Response>,
		): Hono<E, S, BasePath>;
		notFound(handler: (c: Context<E, S>) => Response | Promise<Response>): Hono<E, S, BasePath>;
		basePath<SubPath extends string>(
			path: SubPath,
		): Hono<E, S, BasePath extends "" ? SubPath : `${BasePath}${SubPath}`>;
		fetch(request: Request, env?: E, executionCtx?: ExecutionContext): Promise<Response>;
		request(path: string, options?: RequestInit): Promise<Response>;
	}

	export interface Context<E = unknown, S = unknown> {
		req: Request;
		env: E;
		executionCtx: ExecutionContext;
		set: (key: string | symbol, value: unknown) => void;
		get: <T = unknown>(key: string | symbol) => T;
		header: (name: string, value: string) => Context<E, S>;
		status: (status: number) => Context<E, S>;
		body: (
			body: unknown,
			options?: { headers?: Record<string, string>; status?: number },
		) => Response;
		text: (
			text: string,
			options?: { headers?: Record<string, string>; status?: number },
		) => Response;
		json: <T = unknown>(
			obj: T,
			options?: { headers?: Record<string, string>; status?: number },
		) => Response;
		html: (
			html: string,
			options?: { headers?: Record<string, string>; status?: number },
		) => Response;
		redirect: (location: string, status?: number) => Response;
		notFound: () => Response;
		params: Record<string, string>;
		query: Record<string, string>;
		data: Record<string, unknown>;
		render: (view: string, params?: Record<string, unknown>) => Promise<Response>;
		error: (status: number, message?: string) => Response;
	}

	export function createMiddleware<E = unknown, S = unknown>(): (
		c: Context<E, S>,
		next: () => Promise<void>,
	) => Promise<void>;
}

declare module "hono/cors" {
	import type { Context } from "hono";
	export function cors(options?: {
		origin?:
			| string
			| string[]
			| boolean
			| ((origin: string) => string | boolean | Promise<string | boolean>);
		allowMethods?: string[];
		allowHeaders?: string[];
		exposeHeaders?: string[];
		credentials?: boolean;
		maxAge?: number;
	}): (c: Context, next: () => Promise<void>) => Promise<void>;
}

declare module "hono/logger" {
	import type { Context } from "hono";
	export function logger(): (c: Context, next: () => Promise<void>) => Promise<void>;
}

declare module "hono/pretty-json" {
	import type { Context } from "hono";
	export function prettyJSON(): (c: Context, next: () => Promise<void>) => Promise<void>;
}

declare module "@hono/swagger-ui" {
	import type { Hono } from "hono";
	export function swaggerUI(options: {
		url?: string;
		openapi?: Record<string, unknown>;
	}): (path: string) => (app: Hono) => void;
}

declare module "@hono/zod-validator" {
	import type { Context } from "hono";
	import type { ZodType } from "zod";

	export function zValidator<T extends ZodType>(
		schema: T,
		options?: {
			params?: boolean;
			query?: boolean;
			form?: boolean;
			json?: boolean;
			headers?: boolean;
			cookie?: boolean;
		},
	): (c: Context, next: () => Promise<void>) => Promise<void>;
}

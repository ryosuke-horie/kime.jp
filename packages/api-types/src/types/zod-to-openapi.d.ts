declare module "@asteasolutions/zod-to-openapi" {
	import type { ZodType } from "zod";

	export class OpenAPIRegistry {
		definitions: Record<string, unknown>;
		register(name: string, schema: ZodType): void;
		registerPath(options: {
			method: string;
			path: string;
			tags?: string[];
			summary?: string;
			description?: string;
			security?: Array<Record<string, unknown>>;
			parameters?: unknown[];
			requestBody?: unknown;
			responses: Record<string, unknown>;
		}): void;
		getRef(name: string): { $ref: string };
	}

	export function extendZodWithOpenApi(zod: unknown): void;

	export class OpenApiGeneratorV3 {
		constructor(definitions: Record<string, unknown>);
		generateDocument(options: {
			openapi?: string;
			info: {
				title: string;
				version: string;
				description?: string;
				[key: string]: unknown;
			};
			servers?: Array<{
				url: string;
				description?: string;
			}>;
			security?: Array<Record<string, unknown>>;
			tags?: Array<{
				name: string;
				description?: string;
			}>;
			components?: {
				securitySchemes?: Record<string, unknown>;
				[key: string]: unknown;
			};
		}): Record<string, unknown>;
	}

	// エイリアスを追加
	export { OpenApiGeneratorV3 as OpenAPIGenerator };
}

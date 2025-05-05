// @ts-nocheck

import { OpenApiGeneratorV3 as OpenAPIGenerator } from "@asteasolutions/zod-to-openapi";
import { apiInfo, registry, securitySchemes, servers, tags } from "./config";

/**
 * OpenAPIドキュメントを生成する
 * @returns OpenAPIドキュメントのJSONオブジェクト
 */
export function generateOpenApiDocument() {
	const generator = new OpenAPIGenerator(registry.definitions);

	// OpenAPIドキュメントを生成
	return generator.generateDocument({
		openapi: "3.0.0",
		info: apiInfo,
		servers,
		security: [{ apiKey: [] }],
		tags,
		components: {
			securitySchemes,
		},
	});
}

// 最終的なOpenAPIドキュメントをエクスポート
export const openApiDocument = generateOpenApiDocument();

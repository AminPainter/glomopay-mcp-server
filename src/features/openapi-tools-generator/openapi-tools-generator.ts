import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPIV3 } from 'openapi-types';
import { parseOpenApiToZod } from 'openapi2zod';
import { ZodSchema } from 'zod';

import { DynamicApiTool, IToolConfig, IApiConfig } from '@/shared/tool/tool.module';
import { ApiClient, THttpMethod } from '@/shared/api-client/api-client.module';

/** Names of the path and query parameters declared for a single operation. */
interface IParamLocations {
  pathParams: string[];
  queryParams: string[];
}

export class OpenApiToolGenerator {
  private apiSchemas: Array<[string, ZodSchema]> | null = null;
  // Keyed by `${METHOD} ${path}` so the tool can route inputs by their real
  // OpenAPI location instead of guessing from the HTTP method.
  private paramLocations: Map<string, IParamLocations> = new Map();

  constructor(private apiClient: ApiClient) {}

  async loadApiSchemas(openApiSpecfilePath: string) {
    const openApiDocument = await SwaggerParser.validate(openApiSpecfilePath);
    this.paramLocations = this.buildParamLocations(openApiDocument as OpenAPIV3.Document);
    const zodRecords = parseOpenApiToZod(openApiDocument as OpenAPIV3.Document);
    this.apiSchemas = Object.entries(zodRecords);
  }

  /**
   * Walks the dereferenced spec and records, per operation, which parameters are
   * `in: path` vs `in: query`. `parseOpenApiToZod` collapses path/query/body into
   * one flat schema and drops this distinction, so we recover it from the source.
   */
  private buildParamLocations(document: OpenAPIV3.Document): Map<string, IParamLocations> {
    const locations = new Map<string, IParamLocations>();
    const httpMethods: THttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

    for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
      if (!pathItem) continue;

      for (const method of httpMethods) {
        const operation = pathItem[method.toLowerCase() as OpenAPIV3.HttpMethods];
        if (!operation) continue;

        // Parameters can be declared on the path item (shared) or the operation.
        const parameters = [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])] as OpenAPIV3.ParameterObject[];

        const pathParams = parameters.filter((p) => p.in === 'path').map((p) => p.name);
        const queryParams = parameters.filter((p) => p.in === 'query').map((p) => p.name);

        locations.set(`${method} ${path}`, { pathParams, queryParams });
      }
    }

    return locations;
  }

  generateTools() {
    if (!this.apiSchemas) throw new Error('Api schemas have not been loaded before generating tools');

    const tools = [];
    for (const [endpointName, schema] of this.apiSchemas) {
      try {
        const tool = this.buildDynamicApiTool(endpointName, schema);
        tools.push(tool);
      } catch (error) {
        console.error(`Building tool failed ${endpointName}`);
        console.error(error);
      }
    }

    return tools;
  }

  private buildDynamicApiTool(endpointName: string, schema: ZodSchema) {
    const metadata: { description: string; path: string; method: string } = JSON.parse(schema._def.description!);
    const { description, path } = metadata;
    // openapi2zod emits the method lower-cased ("get"); normalise to the
    // upper-cased THttpMethod the rest of the stack (and axios routing) expects.
    const method = metadata.method.toUpperCase() as THttpMethod;

    const toolConfig: IToolConfig = {
      name: endpointName,
      description,
      inputSchema: { inputs: schema },
    };

    const locations = this.paramLocations.get(`${method} ${path}`);

    const apiConfig: IApiConfig = {
      method,
      path,
      pathParams: locations?.pathParams ?? [],
      queryParams: locations?.queryParams ?? [],
    };

    return new DynamicApiTool(toolConfig, apiConfig, this.apiClient);
  }
}

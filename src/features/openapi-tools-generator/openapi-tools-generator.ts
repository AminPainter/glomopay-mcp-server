import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPIV3 } from 'openapi-types';
import { parseOpenApiToZod } from 'openapi2zod';
import { ZodSchema } from 'zod';

import { DynamicApiTool, IToolConfig, IApiConfig } from '@/shared/tool/tool.module';
import { ApiClient, THttpMethod } from '@/shared/api-client/api-client.module';
import { DownstreamSecretResolver } from '@/features/auth/auth.module';

export class OpenApiToolGenerator {
  private apiSchemas: Array<[string, ZodSchema]> | null = null;

  constructor(
    private apiClient: ApiClient,
    private secretResolver: DownstreamSecretResolver,
  ) {}

  async loadApiSchemas(openApiSpecfilePath: string) {
    const openApiDocument = await SwaggerParser.validate(openApiSpecfilePath);
    const zodRecords = parseOpenApiToZod(openApiDocument as OpenAPIV3.Document);
    this.apiSchemas = Object.entries(zodRecords);
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
    const metadata: { description: string; path: string; method: THttpMethod } = JSON.parse(schema._def.description!);
    const { description, method, path } = metadata;

    const toolConfig: IToolConfig = {
      name: endpointName,
      description,
      inputSchema: { inputs: schema },
    };

    const apiConfig: IApiConfig = {
      method,
      path,
    };

    return new DynamicApiTool(toolConfig, apiConfig, this.apiClient, this.secretResolver);
  }
}

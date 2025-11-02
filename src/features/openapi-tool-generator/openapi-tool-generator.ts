import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPIV3_1 } from 'openapi-types';

import { config } from '../app-config/app.config';

import { OpenApiOperationToolBuilder } from './openapi-operation-tool-builder';
import { OpenApiPathItemProcessor } from './openapi-path-item-processor';

import { ApiClient } from '@/shared/api-client/api-client';

export class OpenApiToolGenerator {
  private openApiSpec: OpenAPIV3_1.Document | null = null;

  async loadOpenApiSpecFile(filePath: string) {
    this.openApiSpec = (await SwaggerParser.validate(filePath)) as OpenAPIV3_1.Document;
  }

  async generateTools() {
    const paths = this.extractPathsFromOenApiSpec();

    const tools = [];
    for (const [pathName, pathItem] of Object.entries(paths)) {
      if (!pathItem) continue;

      const toolsForCurrentPathItem = await this.processPathItem(pathName, pathItem);
      tools.push(...toolsForCurrentPathItem);
    }

    return tools;
  }

  private extractPathsFromOenApiSpec() {
    if (!this.openApiSpec) throw new Error('OpenApiSpec file not loaded');

    const { paths } = this.openApiSpec;
    if (!paths) throw new Error('No paths found');

    return paths;
  }

  private async processPathItem(path: string, pathItem: OpenAPIV3_1.PathItemObject) {
    const apiClient = new ApiClient({
      baseURL: `${config.glomopay.apiHost}/api/v1`,
      headers: {
        Authorization: `Bearer ${config.glomopay.apiSecret}`,
      },
    });
    const openApiOperationToolBuilder = new OpenApiOperationToolBuilder(apiClient);
    const pathItemProcessor = new OpenApiPathItemProcessor(openApiOperationToolBuilder);

    return pathItemProcessor.process(path, pathItem);
  }
}

import { OpenAPIV3_1 } from 'openapi-types';
import { OpenApiOperationToolBuilder } from './openapi-operation-tool-builder';

export class OpenApiPathItemProcessor {
  private static SUPPORTED_HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

  constructor(private operationToolBuilder: OpenApiOperationToolBuilder) {}

  process(path: string, pathItem: OpenAPIV3_1.PathItemObject) {
    const tools = [];

    for (const method of OpenApiPathItemProcessor.SUPPORTED_HTTP_METHODS) {
      const operation = pathItem[method];
      if (!operation) continue;

      const generatedTool = this.processOperationObject(method, path, operation);

      tools.push(generatedTool);
    }

    return tools;
  }

  protected processOperationObject(httpMethod: string, url: string, operation: OpenAPIV3_1.OperationObject) {
    return this.operationToolBuilder.build(httpMethod, url, operation);
  }
}

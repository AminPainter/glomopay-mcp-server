import { OpenAPIV3_1 } from 'openapi-types';

import { ApiClient, THttpMethod } from '@/shared/api-client/api-client.module';
import { IToolConfig, DynamicApiTool } from '@/shared/tool/tool.module';

export class OpenApiOperationToolBuilder {
  constructor(private apiClient: ApiClient) {}

  build(httpMethod: string, url: string, operation: OpenAPIV3_1.OperationObject) {
    const toolConfig: IToolConfig = {
      name: operation.operationId!,
      title: operation.operationId,
      description: operation.description,
    };

    return new DynamicApiTool(toolConfig, { method: httpMethod as THttpMethod, url }, this.apiClient);
  }
}

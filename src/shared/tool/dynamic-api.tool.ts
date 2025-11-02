import { CallToolResult } from '@modelcontextprotocol/sdk/types';
import { ZodRawShape } from 'zod';

import { BaseTool } from './base-tool';
import { IApiConfig, IToolConfig } from './tool.types';

import { ApiClient } from '@/shared/api-client/api-client.module';

export class DynamicApiTool extends BaseTool {
  constructor(
    protected config: IToolConfig,
    protected apiConfig: IApiConfig,
    protected apiClient: ApiClient,
  ) {
    super();
  }

  async execute(args: ZodRawShape): Promise<CallToolResult> {
    const { inputs } = args;

    const response = await this.apiClient.request(this.apiConfig.method, this.apiConfig.path, inputs, undefined);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response),
        },
      ],
    };
  }
}

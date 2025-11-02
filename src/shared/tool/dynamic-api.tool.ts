import { CallToolResult } from '@modelcontextprotocol/sdk/types';

import { BaseTool } from './base-tool';
import { IToolConfig } from './tool.types';

import { ApiClient, THttpMethod } from '@/shared/api-client/api-client.module';
import { ZodRawShape } from 'zod';

export class DynamicApiTool extends BaseTool {
  constructor(
    protected config: IToolConfig,
    protected apiConfig: { method: THttpMethod; url: string },
    protected apiClient: ApiClient,
  ) {
    super();
  }

  async execute(args: ZodRawShape): Promise<CallToolResult> {
    const response = await this.apiClient.request(this.apiConfig.method, this.apiConfig.url, args, undefined);

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

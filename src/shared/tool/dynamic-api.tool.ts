import { CallToolResult } from '@modelcontextprotocol/sdk/types';
import { ZodRawShape } from 'zod';

import { BaseTool } from './base-tool';
import { IApiConfig, IToolConfig, TToolExtra } from './tool.types';

import { ApiClient } from '@/shared/api-client/api-client.module';
import { logger } from '@/shared/logger/logger.module';

export class DynamicApiTool extends BaseTool {
  constructor(
    protected config: IToolConfig,
    protected apiConfig: IApiConfig,
    protected apiClient: ApiClient,
  ) {
    super();
  }

  async execute(args: ZodRawShape, extra: TToolExtra): Promise<CallToolResult> {
    // The per-request bearer token IS the downstream Glomopay secret (API-key pass-through).
    const secret = extra.authInfo?.token;
    if (!secret) {
      return {
        content: [{ type: 'text', text: 'Unauthorized: no Glomopay API secret supplied for this request.' }],
        isError: true,
      };
    }

    const { inputs } = args;

    // Log the exact host/path this dynamic tool is about to hit (no secret, no body).
    logger.info('dynamic-tool', 'Calling downstream API', {
      tool: this.config.name,
      requestId: extra?.requestId,
      method: this.apiConfig.method,
      url: this.apiClient.resolveUrl(this.apiConfig.path),
    });

    const response = await this.apiClient.request(this.apiConfig.method, this.apiConfig.path, inputs, undefined, {
      headers: { Authorization: `Bearer ${secret}` },
    });

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

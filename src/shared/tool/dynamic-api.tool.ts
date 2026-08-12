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

    // `inputs` is a flat object mixing path, query and body params (openapi2zod
    // collapses them into one schema). Split it back apart before dispatching.
    const remaining: Record<string, unknown> = { ...((inputs as unknown as Record<string, unknown>) ?? {}) };

    // 1. Interpolate any {placeholder} path segments and consume those keys.
    const path = this.apiConfig.path.replace(/\{([^}]+)\}/g, (match, key) => {
      if (key in remaining) {
        const value = String(remaining[key]);
        delete remaining[key];
        return encodeURIComponent(value);
      }
      return match;
    });

    // 2. GET/DELETE carry remaining params in the query string; everything else
    //    (POST/PUT/PATCH) carries them in the request body.
    const method = this.apiConfig.method;
    const isBodyless = method === 'GET' || method === 'DELETE';
    const body = isBodyless ? undefined : remaining;
    const requestConfig = {
      headers: { Authorization: `Bearer ${secret}` },
      ...(isBodyless ? { params: remaining } : {}),
    };

    // Log the exact host/path this dynamic tool is about to hit (no secret, no body).
    logger.info('dynamic-tool', 'Calling downstream API', {
      tool: this.config.name,
      requestId: extra?.requestId,
      method,
      url: this.apiClient.resolveUrl(path),
    });

    const response = await this.apiClient.request(method, path, body, undefined, requestConfig);

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

import { CallToolResult } from '@modelcontextprotocol/sdk/types';
import { ZodRawShape } from 'zod';

import { BaseTool } from './base-tool';
import { IApiConfig, IToolConfig, TToolExtra } from './tool.types';

import { ApiClient } from '@/shared/api-client/api-client.module';

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
    // collapses them into one schema). Split it back apart, using the parameter
    // locations the generator recovered from the OpenAPI spec, before dispatching.
    const { method } = this.apiConfig;
    const remaining: Record<string, unknown> = { ...((inputs as unknown as Record<string, unknown>) ?? {}) };

    // 1. Interpolate {placeholder} path segments and consume those keys.
    const path = this.apiConfig.path.replace(/\{([^}]+)\}/g, (match, key) => {
      if (key in remaining) {
        const value = String(remaining[key]);
        delete remaining[key];
        return encodeURIComponent(value);
      }
      return match;
    });

    // 2. Split the remainder into query string vs request body.
    const params: Record<string, unknown> = {};
    for (const name of this.apiConfig.queryParams ?? []) {
      if (name in remaining) {
        params[name] = remaining[name];
        delete remaining[name];
      }
    }

    // Fallback for operations with no spec-declared query params: GET/DELETE have
    // no body, so anything left over must belong in the query string.
    const isBodyless = method === 'GET' || method === 'DELETE';
    if (isBodyless) {
      Object.assign(params, remaining);
      for (const key of Object.keys(remaining)) delete remaining[key];
    }

    const body = isBodyless ? undefined : remaining;
    const requestConfig = {
      headers: { Authorization: `Bearer ${secret}` },
      ...(Object.keys(params).length > 0 ? { params } : {}),
    };

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

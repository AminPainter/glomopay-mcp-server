import { CallToolResult } from '@modelcontextprotocol/sdk/types';
import { ZodRawShape } from 'zod';

import { THttpMethod } from '@/shared/api-client/api-client.module';

export interface IToolConfig {
  name: string;
  title?: string;
  description?: string;
  inputSchema?: ZodRawShape;
}

export interface IApiConfig {
  method: THttpMethod;
  path: string;
}

export interface IToolHandler {
  (args: ZodRawShape): Promise<CallToolResult> | CallToolResult;
}

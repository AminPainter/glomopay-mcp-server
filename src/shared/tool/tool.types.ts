import { CallToolResult, ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { ZodRawShape } from 'zod';

import { THttpMethod } from '@/shared/api-client/api-client.module';

export type TToolExtra = RequestHandlerExtra<ServerRequest, ServerNotification>;

export interface IToolConfig {
  name: string;
  title?: string;
  description?: string;
  inputSchema?: ZodRawShape;
}

export interface IApiConfig {
  method: THttpMethod;
  path: string;
  /**
   * Names of parameters the OpenAPI spec declares as `in: path` / `in: query`.
   * Sourced from the dereferenced spec (not inferred from the HTTP method), so
   * the tool can route each input to the URL path, the query string, or the body
   * even for non-conventional operations (e.g. a POST that takes a query param).
   */
  pathParams?: string[];
  queryParams?: string[];
}

export interface IToolHandler {
  (args: ZodRawShape, extra: TToolExtra): Promise<CallToolResult> | CallToolResult;
}

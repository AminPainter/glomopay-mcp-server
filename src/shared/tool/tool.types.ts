import { CallToolResult } from '@modelcontextprotocol/sdk/types';
import { ZodRawShape } from 'zod';

export interface IToolConfig {
  name: string;
  title: string;
  description: string;
  inputSchema: ZodRawShape;
}

export interface IToolHandler {
  (args: ZodRawShape): Promise<CallToolResult> | CallToolResult;
}

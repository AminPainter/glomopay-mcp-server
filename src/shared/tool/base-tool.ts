import { ZodRawShape } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types';

import { IToolConfig, IToolHandler, TToolExtra } from './tool.types';

export abstract class BaseTool {
  public handler: IToolHandler;
  protected abstract config: IToolConfig;

  constructor() {
    this.handler = this.execute.bind(this);
  }

  getConfig() {
    return this.config;
  }

  getName() {
    return this.config.name;
  }

  abstract execute(args: ZodRawShape, extra: TToolExtra): Promise<CallToolResult> | CallToolResult;
}

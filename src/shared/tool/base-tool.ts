import { CallToolResult } from '@modelcontextprotocol/sdk/types';
import { ZodRawShape } from 'zod';

interface IToolConfig {
  name: string;
  title: string;
  description: string;
  inputSchema: ZodRawShape;
}

type TToolExecutor = (args: ZodRawShape) => Promise<CallToolResult> | CallToolResult;

export abstract class BaseTool {
  public handler: TToolExecutor;
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

  abstract execute(args: ZodRawShape): Promise<CallToolResult> | CallToolResult;
}

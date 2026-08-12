import { ZodRawShape } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types';

import { IToolConfig, IToolHandler, TToolExtra } from './tool.types';

import { logger } from '@/shared/logger/logger.module';

export abstract class BaseTool {
  public handler: IToolHandler;
  protected abstract config: IToolConfig;

  constructor() {
    this.handler = this.loggedExecute.bind(this);
  }

  /**
   * Wraps execute() so every tool logs its invocation step and outcome uniformly.
   * `extra.requestId` is the MCP JSON-RPC id, used to correlate with the HTTP layer.
   */
  private async loggedExecute(args: ZodRawShape, extra: TToolExtra): Promise<CallToolResult> {
    const name = this.config.name;
    const requestId = extra?.requestId;
    const startedAt = Date.now();
    logger.info('tool', 'Tool invoked', { tool: name, requestId });

    try {
      const result = await this.execute(args, extra);
      const durationMs = Date.now() - startedAt;
      if (result?.isError) {
        logger.warn('tool', 'Tool returned error result', { tool: name, requestId, durationMs });
      } else {
        logger.info('tool', 'Tool succeeded', { tool: name, requestId, durationMs });
      }
      return result;
    } catch (err) {
      logger.error('tool', 'Tool threw', {
        tool: name,
        requestId,
        durationMs: Date.now() - startedAt,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  getConfig() {
    return this.config;
  }

  getName() {
    return this.config.name;
  }

  abstract execute(args: ZodRawShape, extra: TToolExtra): Promise<CallToolResult> | CallToolResult;
}

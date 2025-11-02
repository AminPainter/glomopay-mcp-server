import z from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types';

import { BaseTool } from '@/shared/tool/tool.module';

const inputSchema = { name: z.string() };

export class HealthCheckTool extends BaseTool {
  protected config = {
    name: 'healthCheck',
    description: 'This tool will check the health of mcp server',
    title: 'Health Checker',
    inputSchema,
  };

  execute(args: typeof inputSchema): CallToolResult {
    return {
      content: [
        {
          type: 'text',
          text: `I AM GONNA SAY HELLO TO ${args.name} USING MCP SERVER!`,
        },
      ],
    };
  }
}

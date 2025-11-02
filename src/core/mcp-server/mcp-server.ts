import { McpServer as McpServerInternal } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { BaseTool } from '@/shared/tool/tool.module';

export class MCPServer {
  private static SERVER_NAME = 'glomopay';
  private static SERVER_VERSION = '1.0.0';
  private static instance: MCPServer;

  private server: McpServerInternal;

  private constructor() {
    this.server = new McpServerInternal({
      name: MCPServer.SERVER_NAME,
      version: MCPServer.SERVER_VERSION,
    });
  }

  static getInstance() {
    if (!MCPServer.instance) MCPServer.instance = new MCPServer();

    return MCPServer.instance;
  }

  registerTool(tool: BaseTool) {
    const config = tool.getConfig();

    this.server.registerTool(
      tool.getName(),
      {
        title: config.title,
        description: config.description,
        inputSchema: config.inputSchema,
      },
      tool.handler,
    );

    return this;
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

import path from 'path';

import { MCPServer } from '@/core/mcp-server/mcp-server.module';
import { OpenApiToolGenerator } from '@/features/openapi-tools-generator/openapi-tools-generator.module';
import { ApiClient } from '@/shared/api-client/api-client.module';
import { config } from '@/features/app-config/app-config.module';
import { HealthCheckTool } from './features/health-check/health-check.module';

(async () => {
  const mcpServer = MCPServer.getInstance();

  const apiClient = new ApiClient({
    baseURL: `${config.glomopay.apiHost}/api/v1`,
    headers: {
      Authorization: `Bearer ${config.glomopay.apiSecret}`,
    },
  });
  const openApiToolsGenerator = new OpenApiToolGenerator(apiClient);

  const openApiSpecFilePath = path.resolve(__dirname, 'openapi.json');
  await openApiToolsGenerator.loadApiSchemas(openApiSpecFilePath);

  const tools = openApiToolsGenerator.generateTools();
  tools.forEach((t) => mcpServer.registerTool(t));

  mcpServer.registerTool(new HealthCheckTool());

  mcpServer.start();
  console.error('Glomopay MCP Server running on STDIO');
})();

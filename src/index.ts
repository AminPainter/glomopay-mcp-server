import path from 'path';

import { MCPServer } from '@/core/mcp-server/mcp-server.module';
import { createHttpServer } from '@/core/http/http-server.module';
import { OpenApiToolGenerator } from '@/features/openapi-tools-generator/openapi-tools-generator.module';
import { ApiClient } from '@/shared/api-client/api-client.module';
import { config } from '@/features/app-config/app-config.module';
import { createDownstreamSecretResolver } from '@/features/auth/auth.module';
import { HealthCheckTool } from './features/health-check/health-check.module';

(async () => {
  const mcpServer = MCPServer.getInstance();

  const apiClient = new ApiClient({
    baseURL: `${config.glomopay.apiHost}/api/v1`,
  });
  const secretResolver = createDownstreamSecretResolver(config.authMode);
  const openApiToolsGenerator = new OpenApiToolGenerator(apiClient, secretResolver);

  const openApiSpecFilePath = path.resolve(__dirname, 'openapi.json');
  await openApiToolsGenerator.loadApiSchemas(openApiSpecFilePath);

  const tools = openApiToolsGenerator.generateTools();
  tools.forEach((t) => mcpServer.registerTool(t));

  mcpServer.registerTool(new HealthCheckTool());

  if (config.transport === 'stdio') {
    await mcpServer.startStdio();
    console.error('Glomopay MCP Server running on STDIO');
  } else {
    const app = createHttpServer(mcpServer, config.authMode);
    app.listen(config.http.port, config.http.host, () => {
      console.error(`Glomopay MCP Server running on HTTP ${config.http.host}:${config.http.port}/mcp`);
    });
  }
})();

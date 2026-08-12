import path from 'path';

import { MCPServer } from '@/core/mcp-server/mcp-server.module';
import { createHttpServer } from '@/core/http/http-server.module';
import { OpenApiToolGenerator } from '@/features/openapi-tools-generator/openapi-tools-generator.module';
import { ApiClient } from '@/shared/api-client/api-client.module';
import { config } from '@/features/app-config/app-config.module';
import { logger } from '@/shared/logger/logger.module';
import { HealthCheckTool } from './features/health-check/health-check.module';

(async () => {
  const mcpServer = MCPServer.getInstance();

  const apiClient = new ApiClient({
    baseURL: `${config.glomopay.apiHost}/api/v1`,
  });
  const openApiToolsGenerator = new OpenApiToolGenerator(apiClient);

  const openApiSpecFilePath = path.resolve(__dirname, 'openapi.json');
  await openApiToolsGenerator.loadApiSchemas(openApiSpecFilePath);

  const tools = openApiToolsGenerator.generateTools();
  tools.forEach((t) => mcpServer.registerTool(t));

  mcpServer.registerTool(new HealthCheckTool());
  logger.info('startup', 'Tools registered', { count: tools.length + 1 });

  const app = createHttpServer(mcpServer);
  app.listen(config.http.port, config.http.host, () => {
    logger.info('startup', 'Glomopay MCP Server listening', {
      host: config.http.host,
      port: config.http.port,
      path: '/mcp',
    });
  });
})();

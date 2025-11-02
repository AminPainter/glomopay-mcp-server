import path from 'path';

import { MCPServer } from '@/core/mcp-server/mcp-server.module';
import { OpenApiToolGenerator } from '@/features/openapi-tool-generator/openapi-tool-generator.module';

(async () => {
  const mcpServer = MCPServer.getInstance();

  const openApiSpecFilePath = path.resolve(__dirname, 'openapi.json');
  const openApiToolsGenerator = new OpenApiToolGenerator();
  await openApiToolsGenerator.loadOpenApiSpecFile(openApiSpecFilePath);

  const tools = await openApiToolsGenerator.generateTools();

  tools.forEach((t) => mcpServer.registerTool(t));

  mcpServer.start();
})();

import express, { Express } from 'express';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { MCPServer } from '@/core/mcp-server/mcp-server.module';
import { apiKeyAuthMiddleware } from '@/features/auth/auth.module';

const METHOD_NOT_ALLOWED_STATELESS = {
  error: 'Method not allowed: this server runs stateless Streamable HTTP and only supports POST /mcp.',
};

export function createHttpServer(mcpServer: MCPServer): Express {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json());

  app.post('/mcp', apiKeyAuthMiddleware, async (req, res) => {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => transport.close());

    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.get('/mcp', (_req, res) => res.status(405).json(METHOD_NOT_ALLOWED_STATELESS));
  app.delete('/mcp', (_req, res) => res.status(405).json(METHOD_NOT_ALLOWED_STATELESS));

  return app;
}

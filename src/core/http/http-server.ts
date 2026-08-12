import { randomUUID } from 'crypto';

import express, { Express } from 'express';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { MCPServer } from '@/core/mcp-server/mcp-server.module';
import { apiKeyAuthMiddleware } from '@/features/auth/auth.module';
import { logger } from '@/shared/logger/logger.module';

const METHOD_NOT_ALLOWED_STATELESS = {
  error: 'Method not allowed: this server runs stateless Streamable HTTP and only supports POST /mcp.',
};

export function createHttpServer(mcpServer: MCPServer): Express {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json());

  app.post('/mcp', apiKeyAuthMiddleware, async (req, res) => {
    // Correlation id ties every log line for this invocation together.
    const requestId = randomUUID();
    const startedAt = Date.now();
    const method = (req.body as { method?: string } | undefined)?.method;
    logger.info('http', 'MCP request received', { requestId, method, ip: req.ip });

    res.on('finish', () => {
      const level = res.statusCode >= 400 ? 'warn' : 'info';
      logger[level]('http', 'MCP request completed', {
        requestId,
        method,
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
      });
    });

    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => transport.close());

    try {
      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      logger.error('http', 'MCP request failed', {
        requestId,
        method,
        durationMs: Date.now() - startedAt,
        error: err instanceof Error ? err.message : String(err),
      });
      if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/mcp', (_req, res) => res.status(405).json(METHOD_NOT_ALLOWED_STATELESS));
  app.delete('/mcp', (_req, res) => res.status(405).json(METHOD_NOT_ALLOWED_STATELESS));

  return app;
}

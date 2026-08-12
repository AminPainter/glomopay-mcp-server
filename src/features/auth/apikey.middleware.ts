import { NextFunction, Request, RequestHandler, Response } from 'express';

import { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthInfo;
  }
}

const BEARER_PREFIX = 'Bearer ';

export function apiKeyAuthMiddleware(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith(BEARER_PREFIX) ? header.slice(BEARER_PREFIX.length).trim() : undefined;

    if (!token) {
      res.status(401).json({ error: 'Missing or malformed Authorization: Bearer <glomopay-secret> header.' });
      return;
    }

    req.auth = { token, clientId: 'apikey-passthrough', scopes: [] };
    next();
  };
}

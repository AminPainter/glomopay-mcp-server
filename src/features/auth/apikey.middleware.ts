import { RequestHandler } from 'express';

import { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthInfo;
  }
}

const BEARER_PREFIX = 'Bearer ';

/**
 * Requires `Authorization: Bearer <glomopay-secret>` on every request and exposes it to
 * tools as `extra.authInfo.token`. The bearer IS the downstream Glomopay secret (API-key
 * pass-through) — the server proxies calls under the caller's own key.
 */
export const apiKeyAuthMiddleware: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith(BEARER_PREFIX) ? header.slice(BEARER_PREFIX.length).trim() : undefined;

  if (!token) {
    res.status(401).json({ error: 'Missing or malformed Authorization: Bearer <glomopay-secret> header.' });
    return;
  }

  req.auth = { token, clientId: 'apikey-passthrough', scopes: [] };
  next();
};

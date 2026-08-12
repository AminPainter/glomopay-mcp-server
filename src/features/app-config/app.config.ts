export type TTransport = 'http' | 'stdio';
export type TAuthMode = 'apikey';

export const config = {
  glomopay: {
    apiHost: process.env.API_HOST,
  },
  transport: (process.env.MCP_TRANSPORT as TTransport) || 'http',
  authMode: (process.env.AUTH_MODE as TAuthMode) || 'apikey',
  http: {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || '127.0.0.1',
  },
  // Dev-only fallback so a developer can run stdio mode locally without an HTTP auth flow.
  // Only ever consulted when transport === 'stdio' (see ApiKeyResolver) — never in remote/http mode.
  devApiSecretKey: process.env.DEV_API_SECRET_KEY,
};

export type TAuthMode = 'apikey';

export const config = {
  glomopay: {
    apiHost: process.env.API_HOST,
  },
  authMode: (process.env.AUTH_MODE as TAuthMode) || 'apikey',
  http: {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || '127.0.0.1',
  },
};

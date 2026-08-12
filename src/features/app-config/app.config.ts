export const config = {
  glomopay: {
    apiHost: process.env.API_HOST,
  },
  http: {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || '127.0.0.1',
  },
};

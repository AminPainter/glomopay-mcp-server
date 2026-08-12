import { RequestHandler } from 'express';

import { TAuthMode } from '@/features/app-config/app-config.module';

import { DownstreamSecretResolver } from './auth.types';
import { ApiKeyResolver } from './apikey.resolver';
import { apiKeyAuthMiddleware } from './apikey.middleware';

export function createDownstreamSecretResolver(authMode: TAuthMode): DownstreamSecretResolver {
  switch (authMode) {
    case 'apikey':
      return new ApiKeyResolver();
    // Future seam: case 'oauth': return new OAuthResolver(...) — validate JWT, map principal to secret store.
    default:
      throw new Error(`Unsupported auth mode: ${authMode}`);
  }
}

export function createAuthMiddleware(authMode: TAuthMode): RequestHandler {
  switch (authMode) {
    case 'apikey':
      return apiKeyAuthMiddleware();
    // Future seam: case 'oauth': return requireBearerAuth({ verifier: ... }) from the SDK.
    default:
      throw new Error(`Unsupported auth mode: ${authMode}`);
  }
}

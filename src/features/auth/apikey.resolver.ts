import { TToolExtra } from '@/shared/tool/tool.module';

import { DownstreamSecretResolver } from './auth.types';

export class ApiKeyResolver implements DownstreamSecretResolver {
  resolve(extra: TToolExtra): string | undefined {
    // The bearer token supplied per request IS the downstream Glomopay secret.
    return extra.authInfo?.token;
  }
}

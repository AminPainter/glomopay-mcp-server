import { TToolExtra } from '@/shared/tool/tool.module';
import { config } from '@/features/app-config/app-config.module';

import { DownstreamSecretResolver } from './auth.types';

export class ApiKeyResolver implements DownstreamSecretResolver {
  resolve(extra: TToolExtra): string | undefined {
    const bearerToken = extra.authInfo?.token;
    if (bearerToken) return bearerToken;

    // STDIO has no HTTP authInfo — fall back to a developer's own local-only key.
    // Never consulted in http mode, so a shared secret can't leak across tenants.
    if (config.transport === 'stdio') return config.devApiSecretKey;

    return undefined;
  }
}

import { TToolExtra } from '@/shared/tool/tool.module';

export interface DownstreamSecretResolver {
  resolve(extra: TToolExtra): string | undefined;
}

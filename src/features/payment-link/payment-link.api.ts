import { TCreatePaymentLinkSchema } from './payment-link.validation';

import { apiClient } from '@/shared/api-client/api-client.singleton';

export const createPaymentLink = async (payload: TCreatePaymentLinkSchema['body']) => {
  const data = await apiClient.post('/payin', payload);
  return data;
};

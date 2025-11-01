import { apiClient } from '@/shared/api-client/api-client.singleton';
import { TCustomersListApiResponse } from './customer.types';

export const fetchCustomersList = async () => {
  const data = await apiClient.get('/customer');
  return data as TCustomersListApiResponse;
};

import { apiClient } from '../../lib/api/client';
import type { ClientCase } from './cases.types';

export async function getMyCases() {
  const { data } = await apiClient.get<ClientCase[]>('/client/cases');
  return data;
}

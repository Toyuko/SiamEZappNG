import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';
import type { ClientCase } from './cases.types';

export async function getMyCases() {
  const response = await api.get<ClientCase[] | ApiEnvelope<ClientCase[]>>('/api/cases');
  return unwrapApiData<ClientCase[]>(response);
}

export async function getCaseById(id: string) {
  const response = await api.get<(ClientCase & Record<string, unknown>) | ApiEnvelope<ClientCase & Record<string, unknown>>>(
    `/api/cases/${encodeURIComponent(id)}`,
  );
  return unwrapApiData<ClientCase & Record<string, unknown>>(response);
}

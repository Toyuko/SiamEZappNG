import { api } from '../../lib/api';
import type { ClientCase } from './cases.types';

export async function getMyCases() {
  return api.get<ClientCase[]>('/api/cases');
}

export async function getCaseById(id: string) {
  return api.get<ClientCase & Record<string, unknown>>(`/api/cases/${encodeURIComponent(id)}`);
}

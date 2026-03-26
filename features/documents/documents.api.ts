import { apiClient } from '../../lib/api/client';

import type { ClientDocument } from './documents.types';

export async function getMyDocuments() {
  const { data } = await apiClient.get<ClientDocument[]>('/client/documents');
  return data;
}

import { apiClient } from '../../lib/api/client';

import type { ClientInvoice } from './payments.types';

export async function getMyInvoices() {
  const { data } = await apiClient.get<ClientInvoice[]>('/client/invoices');
  return data;
}

import type { ClientInvoice } from './payments.types';
import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

export async function getMyInvoices() {
  const response = await api.get<ClientInvoice[] | ApiEnvelope<ClientInvoice[]>>('/api/invoices');
  return unwrapApiData<ClientInvoice[]>(response);
}

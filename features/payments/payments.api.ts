import type { ClientInvoice } from './payments.types';
import { api } from '../../lib/api';

export async function getMyInvoices() {
  return api.get<ClientInvoice[]>('/api/invoices');
}

import { useQuery } from '@tanstack/react-query';

import { getMyInvoices } from '../features/payments/payments.api';

export function useInvoices() {
  return useQuery({
    queryKey: ['my-invoices'],
    queryFn: getMyInvoices,
  });
}

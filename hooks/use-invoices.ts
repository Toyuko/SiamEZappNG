import { useQuery } from '@tanstack/react-query';

import { getMyInvoices } from '../features/payments/payments.api';
import { useSessionQueryEnabled } from './use-session-query-enabled';

export function useInvoices() {
  const enabled = useSessionQueryEnabled();
  return useQuery({
    queryKey: ['my-invoices'],
    queryFn: getMyInvoices,
    enabled,
  });
}

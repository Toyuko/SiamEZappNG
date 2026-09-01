import { useQuery } from '@tanstack/react-query';

import { getDashboardOverview } from '../features/dashboard/dashboard.api';
import { useSessionQueryEnabled } from './use-session-query-enabled';

export function useDashboard() {
  const enabled = useSessionQueryEnabled();
  return useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: getDashboardOverview,
    enabled,
  });
}

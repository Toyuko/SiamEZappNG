import { useQuery } from '@tanstack/react-query';

import { getDashboardOverview } from '../features/dashboard/dashboard.api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: getDashboardOverview,
  });
}

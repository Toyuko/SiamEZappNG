import { useQuery } from '@tanstack/react-query';

import { fetchCorporateDashboardData } from '../features/corporate/corporate.api';
import { isCorporateRole } from '../lib/auth/role';
import { useAuthStore } from '../store/auth-store';

export function useCorporateDashboard() {
  const userRole = useAuthStore((state) => state.userRole);
  const user = useAuthStore((state) => state.user);
  const isCorporate = isCorporateRole(userRole, user?.role);

  return useQuery({
    queryKey: ['corporate-dashboard'],
    queryFn: fetchCorporateDashboardData,
    enabled: isCorporate,
  });
}

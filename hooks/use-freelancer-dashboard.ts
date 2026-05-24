import { useQuery } from '@tanstack/react-query';

import { getFreelancerDashboard } from '../features/freelancer/freelancer.api';
import { useAuthStore } from '../store/auth-store';

export function useFreelancerDashboard() {
  const userRole = useAuthStore((state) => state.userRole);
  const user = useAuthStore((state) => state.user);
  const isFreelancer = userRole === 'freelancer' || user?.role === 'freelancer';

  return useQuery({
    queryKey: ['freelancer-dashboard'],
    queryFn: getFreelancerDashboard,
    enabled: isFreelancer,
  });
}

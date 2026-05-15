import { useQuery } from '@tanstack/react-query';

import { getFreelancerDashboard } from '../features/freelancer/freelancer.api';
import { useAuthStore } from '../store/auth-store';

export function useFreelancerDashboard() {
  const userRole = useAuthStore((state) => state.userRole);

  return useQuery({
    queryKey: ['freelancer-dashboard'],
    queryFn: getFreelancerDashboard,
    enabled: userRole === 'freelancer',
  });
}

import { useQuery } from '@tanstack/react-query';

import { getFreelancerJobById } from '../features/freelancer/freelancer.api';

export function useFreelancerJob(id: string | undefined) {
  return useQuery({
    queryKey: ['freelancer-job', id],
    queryFn: () => getFreelancerJobById(id!),
    enabled: Boolean(id),
  });
}

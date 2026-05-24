import { useQuery } from '@tanstack/react-query';

import { fetchFreelancerJobTracking } from '../services/trackingApi';

export function useFreelancerJobTracking(jobId: string | undefined) {
  return useQuery({
    queryKey: ['freelancer-job-tracking', jobId],
    queryFn: () => fetchFreelancerJobTracking(jobId!),
    enabled: Boolean(jobId),
  });
}

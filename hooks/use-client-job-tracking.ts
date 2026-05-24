import { useQuery } from '@tanstack/react-query';

import { fetchClientJobTracking } from '../services/trackingApi';

export function useClientJobTracking(jobId: string | undefined) {
  return useQuery({
    queryKey: ['client-job-tracking', jobId],
    queryFn: () => fetchClientJobTracking(jobId!),
    enabled: Boolean(jobId),
  });
}

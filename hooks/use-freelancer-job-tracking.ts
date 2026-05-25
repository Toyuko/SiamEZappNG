import { useQuery } from '@tanstack/react-query';

import { jobTrackingQueryKey } from './use-job-tracking-realtime';
import { fetchJobTracking } from '../services/trackingApi';

export function useFreelancerJobTracking(jobId: string | undefined) {
  return useQuery({
    queryKey: jobTrackingQueryKey(jobId ?? '', 'freelancer'),
    queryFn: () => fetchJobTracking(jobId!, 'freelancer'),
    enabled: Boolean(jobId),
  });
}

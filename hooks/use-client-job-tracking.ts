import { useQuery } from '@tanstack/react-query';

import { jobTrackingQueryKey } from './use-job-tracking-realtime';
import { fetchJobTracking } from '../services/trackingApi';

export function useClientJobTracking(jobId: string | undefined) {
  return useQuery({
    queryKey: jobTrackingQueryKey(jobId ?? '', 'client'),
    queryFn: () => fetchJobTracking(jobId!, 'client'),
    enabled: Boolean(jobId),
  });
}

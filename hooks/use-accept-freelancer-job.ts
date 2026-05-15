import { useMutation, useQueryClient } from '@tanstack/react-query';

import { acceptFreelancerJob } from '../features/freelancer/freelancer.api';

export function useAcceptFreelancerJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => acceptFreelancerJob(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['freelancer-dashboard'] });
    },
  });
}

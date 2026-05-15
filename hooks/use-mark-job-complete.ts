import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markFreelancerJobComplete } from '../features/freelancer/freelancer.api';

export function useMarkJobComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => markFreelancerJobComplete(jobId),
    onSuccess: (_data, jobId) => {
      void queryClient.invalidateQueries({ queryKey: ['freelancer-dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['freelancer-job', jobId] });
    },
  });
}

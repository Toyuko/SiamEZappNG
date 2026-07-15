import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchMyFreelancerProfile,
  updateMyFreelancerProfile,
} from '../features/freelancer/freelancer-profile.api';
import type { FreelancerProfileUpdateInput } from '../features/freelancer/freelancer-profile.types';
import { useAuthStore } from '../store/auth-store';

export const myFreelancerProfileQueryKey = ['freelancer-me'] as const;

export function useMyFreelancerProfile() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isGuest = useAuthStore((state) => state.isGuest);

  return useQuery({
    queryKey: myFreelancerProfileQueryKey,
    queryFn: fetchMyFreelancerProfile,
    enabled: Boolean(accessToken) && !isGuest,
  });
}

export function useUpdateMyFreelancerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FreelancerProfileUpdateInput) => updateMyFreelancerProfile(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: myFreelancerProfileQueryKey });
      void queryClient.invalidateQueries({ queryKey: ['freelancer-public'] });
      void queryClient.invalidateQueries({ queryKey: ['freelancer-directory'] });
    },
  });
}

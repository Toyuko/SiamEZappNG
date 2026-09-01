import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchMyFreelancerProfile,
  updateMyFreelancerProfile,
} from '../features/freelancer/freelancer-profile.api';
import type { FreelancerProfileUpdateInput } from '../features/freelancer/freelancer-profile.types';
import { mapApiRoleToUserRole } from '../lib/auth/role';
import { saveUserRole } from '../lib/storage/user-role-storage';
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
  const setSession = useAuthStore((state) => state.setSession);
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (data: FreelancerProfileUpdateInput) => updateMyFreelancerProfile(data),
    onSuccess: async (result) => {
      void queryClient.invalidateQueries({ queryKey: myFreelancerProfileQueryKey });
      void queryClient.invalidateQueries({ queryKey: ['freelancer-public'] });
      void queryClient.invalidateQueries({ queryKey: ['freelancer-directory'] });
      void queryClient.invalidateQueries({ queryKey: ['freelancer-dashboard'] });

      // Profile save can promote customer → freelancer; keep app role in sync with web.
      const nextRole = result.user?.role ?? currentUser?.role;
      if (accessToken && currentUser && nextRole) {
        const mapped = mapApiRoleToUserRole(nextRole);
        if (mapped) {
          await saveUserRole(mapped);
          setSession({
            accessToken,
            user: {
              ...currentUser,
              role: nextRole,
              name: result.user?.name ?? currentUser.name,
              email: result.user?.email ?? currentUser.email,
            },
            userRole: mapped,
          });
        }
      }
    },
  });
}

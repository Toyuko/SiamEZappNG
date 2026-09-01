import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  decideCorporateApplicant,
  fetchCorporateJobs,
  submitJobOpening,
} from '../features/corporate/corporate.api';
import type { ApplicantDecisionInput, SubmitJobOpeningInput } from '../features/corporate/corporate.types';
import { isCorporateRole } from '../lib/auth/role';
import { useAuthStore } from '../store/auth-store';

export function useCorporateJobs() {
  const userRole = useAuthStore((state) => state.userRole);
  const user = useAuthStore((state) => state.user);
  const isCorporate = isCorporateRole(userRole, user?.role);

  return useQuery({
    queryKey: ['corporate-jobs'],
    queryFn: fetchCorporateJobs,
    enabled: isCorporate,
  });
}

export function useSubmitJobOpening() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitJobOpeningInput) => submitJobOpening(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['corporate-jobs'] });
      void queryClient.invalidateQueries({ queryKey: ['corporate-dashboard'] });
    },
  });
}

export function useDecideCorporateApplicant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ApplicantDecisionInput) => decideCorporateApplicant(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['corporate-jobs'] });
      void queryClient.invalidateQueries({ queryKey: ['corporate-dashboard'] });
    },
  });
}

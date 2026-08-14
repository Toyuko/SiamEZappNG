import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createGoal,
  deleteGoal,
  fetchMyGoals,
  updateGoalProgress,
  updateGoalStatus,
} from '../features/goals/goals.api';
import type { CreateGoalInput, GoalStatus } from '../features/goals/goals.types';
import { useSessionQueryEnabled } from './use-session-query-enabled';

export const goalsQueryKey = ['goals'] as const;

export function useGoals() {
  const enabled = useSessionQueryEnabled();
  return useQuery({
    queryKey: goalsQueryKey,
    queryFn: fetchMyGoals,
    enabled,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoalInput) => createGoal(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: goalsQueryKey });
    },
  });
}

export function useUpdateGoalStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, status }: { goalId: string; status: GoalStatus }) =>
      updateGoalStatus(goalId, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: goalsQueryKey });
    },
  });
}

export function useUpdateGoalProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, progressPct }: { goalId: string; progressPct: number }) =>
      updateGoalProgress(goalId, progressPct),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: goalsQueryKey });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => deleteGoal(goalId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: goalsQueryKey });
    },
  });
}

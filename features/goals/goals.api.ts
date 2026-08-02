import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';
import type { CreateGoalInput, GoalStatus, PlatformGoal } from './goals.types';

export async function fetchMyGoals() {
  const response = await api.get<PlatformGoal[] | ApiEnvelope<PlatformGoal[]>>('/api/v1/goals');
  return unwrapApiData(response);
}

export async function createGoal(input: CreateGoalInput) {
  const response = await api.post<PlatformGoal | ApiEnvelope<PlatformGoal>>('/api/v1/goals', input);
  return unwrapApiData(response);
}

export async function updateGoalStatus(goalId: string, status: GoalStatus) {
  const response = await api.patch<PlatformGoal | ApiEnvelope<PlatformGoal>>(
    `/api/v1/goals/${goalId}`,
    { status }
  );
  return unwrapApiData(response);
}

export async function updateGoalProgress(goalId: string, progressPct: number) {
  const response = await api.patch<PlatformGoal | ApiEnvelope<PlatformGoal>>(
    `/api/v1/goals/${goalId}`,
    { progressPct }
  );
  return unwrapApiData(response);
}

export async function deleteGoal(goalId: string) {
  const response = await api.delete<{ deleted: boolean } | ApiEnvelope<{ deleted: boolean }>>(
    `/api/v1/goals/${goalId}`
  );
  return unwrapApiData(response);
}

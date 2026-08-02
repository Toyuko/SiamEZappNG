import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchActiveLifeEvents,
  fetchMyLifeEventRuns,
  startLifeEvent,
  updateLifeEventStepStatus,
} from '../features/life-events/life-events.api';
import type { LifeEventStepStatus } from '../features/life-events/life-events.types';

export const lifeEventsCatalogKey = ['life-events', 'catalog'] as const;
export const lifeEventRunsKey = ['life-events', 'runs'] as const;
const goalsQueryKey = ['goals'] as const;

export function useLifeEventsCatalog() {
  return useQuery({
    queryKey: lifeEventsCatalogKey,
    queryFn: fetchActiveLifeEvents,
  });
}

export function useLifeEventRuns() {
  return useQuery({
    queryKey: lifeEventRunsKey,
    queryFn: fetchMyLifeEventRuns,
  });
}

export function useStartLifeEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lifeEventId: string) => startLifeEvent(lifeEventId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: lifeEventRunsKey });
      void qc.invalidateQueries({ queryKey: goalsQueryKey });
    },
  });
}

export function useUpdateLifeEventStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      progressId,
      stepId,
      status,
    }: {
      progressId: string;
      stepId: string;
      status: LifeEventStepStatus;
    }) => updateLifeEventStepStatus(progressId, stepId, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: lifeEventRunsKey });
      void qc.invalidateQueries({ queryKey: goalsQueryKey });
    },
  });
}

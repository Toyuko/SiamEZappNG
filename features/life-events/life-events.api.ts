import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';
import type {
  LifeEventDefinition,
  LifeEventRun,
  LifeEventRunStatus,
  LifeEventStepStatus,
} from './life-events.types';

export async function fetchActiveLifeEvents() {
  const response = await api.get<
    LifeEventDefinition[] | ApiEnvelope<LifeEventDefinition[]>
  >('/api/v1/life-events');
  return unwrapApiData(response);
}

export async function fetchMyLifeEventRuns() {
  const response = await api.get<LifeEventRun[] | ApiEnvelope<LifeEventRun[]>>(
    '/api/v1/life-events/runs'
  );
  return unwrapApiData(response);
}

export async function startLifeEvent(lifeEventId: string) {
  const response = await api.post<LifeEventRun | ApiEnvelope<LifeEventRun>>(
    `/api/v1/life-events/${lifeEventId}/runs`
  );
  return unwrapApiData(response);
}

export async function updateLifeEventRunStatus(
  progressId: string,
  status: LifeEventRunStatus
) {
  const response = await api.patch<LifeEventRun | ApiEnvelope<LifeEventRun>>(
    `/api/v1/life-events/runs/${progressId}`,
    { status }
  );
  return unwrapApiData(response);
}

export async function updateLifeEventStepStatus(
  progressId: string,
  stepId: string,
  status: LifeEventStepStatus
) {
  const response = await api.patch<LifeEventRun | ApiEnvelope<LifeEventRun>>(
    `/api/v1/life-events/runs/${progressId}/steps/${stepId}`,
    { status }
  );
  return unwrapApiData(response);
}

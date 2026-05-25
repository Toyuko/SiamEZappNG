import type {
  JobTrackingPayload,
  TrackingHistoryEntry,
  TrackingStatus,
} from '../../types/tracking';

function isTrackingHistoryEntry(value: unknown): value is TrackingHistoryEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const entry = value as Record<string, unknown>;
  return typeof entry.id === 'string' && typeof entry.status === 'string' && typeof entry.createdAt === 'string';
}

function normalizeHistory(payload: unknown): TrackingHistoryEntry[] | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const raw = payload as Record<string, unknown>;
  const nested =
    raw.trackingHistory && Array.isArray(raw.trackingHistory)
      ? raw.trackingHistory
      : raw.history && Array.isArray(raw.history)
        ? raw.history
        : Array.isArray(payload)
          ? payload
          : null;

  if (!nested) {
    return null;
  }

  return nested.filter(isTrackingHistoryEntry) as TrackingHistoryEntry[];
}

/**
 * Merges a `tracking-updated` Pusher payload into the cached tracking query shape.
 */
export function mergeTrackingUpdatedPayload(
  current: JobTrackingPayload,
  payload: unknown,
): JobTrackingPayload {
  if (!payload || typeof payload !== 'object') {
    return current;
  }

  const raw = payload as Record<string, unknown>;
  const data =
    raw.data && typeof raw.data === 'object' ? (raw.data as Record<string, unknown>) : raw;
  const jobPatch =
    data.job && typeof data.job === 'object' ? (data.job as Record<string, unknown>) : data;

  const trackingHistory = normalizeHistory(data) ?? normalizeHistory(payload) ?? current.trackingHistory;

  const nextJob = { ...current.job };

  if (typeof jobPatch.trackingStatus === 'string') {
    nextJob.trackingStatus = jobPatch.trackingStatus as TrackingStatus;
  }
  if (typeof jobPatch.status === 'string') {
    nextJob.status = jobPatch.status as JobTrackingPayload['job']['status'];
  }
  if ('trackingNotes' in jobPatch) {
    nextJob.trackingNotes =
      typeof jobPatch.trackingNotes === 'string' ? jobPatch.trackingNotes : null;
  }
  if (typeof jobPatch.isCurrentlyInTransit === 'boolean') {
    nextJob.isCurrentlyInTransit = jobPatch.isCurrentlyInTransit;
  }
  if ('completionSubmittedAt' in jobPatch) {
    nextJob.completionSubmittedAt =
      typeof jobPatch.completionSubmittedAt === 'string' ? jobPatch.completionSubmittedAt : null;
  }
  if (typeof jobPatch.updatedAt === 'string') {
    nextJob.updatedAt = jobPatch.updatedAt;
  }
  if (typeof jobPatch.title === 'string') {
    nextJob.title = jobPatch.title;
  }

  return {
    ...current,
    job: nextJob,
    trackingHistory,
    steps: Array.isArray(data.steps) ? (data.steps as JobTrackingPayload['steps']) : current.steps,
    isTrackable:
      typeof data.isTrackable === 'boolean' ? data.isTrackable : current.isTrackable,
  };
}

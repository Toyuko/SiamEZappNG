import { describe, expect, it } from 'vitest';

import { mergeTrackingUpdatedPayload } from '../../lib/tracking/pusher-payload';
import { jobTrackingChannel, JOB_TRACKING_UPDATED_EVENT } from '../../types/tracking';
import type { JobTrackingPayload } from '../../types/tracking';

const basePayload: JobTrackingPayload = {
  job: {
    id: 'job-1',
    title: 'DLT Service',
    status: 'in_progress',
    trackingStatus: 'DOCUMENTS_PENDING',
    trackingNotes: null,
    completionSubmittedAt: null,
    updatedAt: '2026-05-25T08:00:00.000Z',
    service: { id: 'svc-1', slug: 'dlt', name: 'DLT' },
  },
  trackingHistory: [
    {
      id: 'h1',
      status: 'DOCUMENTS_PENDING',
      note: 'Started',
      createdAt: '2026-05-25T08:00:00.000Z',
    },
  ],
  steps: null,
  isTrackable: true,
};

describe('job tracking realtime helpers', () => {
  it('builds the unified private job channel name', () => {
    expect(jobTrackingChannel('job-42')).toBe('private-job-job-42');
  });

  it('uses the tracking-updated event name', () => {
    expect(JOB_TRACKING_UPDATED_EVENT).toBe('tracking-updated');
  });

  it('merges tracking-updated payloads into query cache shape', () => {
    const merged = mergeTrackingUpdatedPayload(basePayload, {
      job: { trackingStatus: 'APPOINTMENT_SET', status: 'in_progress' },
      trackingHistory: [
        ...basePayload.trackingHistory,
        {
          id: 'h2',
          status: 'APPOINTMENT_SET',
          note: 'Booked',
          createdAt: '2026-05-25T09:00:00.000Z',
        },
      ],
    });

    expect(merged.job.trackingStatus).toBe('APPOINTMENT_SET');
    expect(merged.trackingHistory).toHaveLength(2);
    expect(merged.trackingHistory[1]?.status).toBe('APPOINTMENT_SET');
  });
});

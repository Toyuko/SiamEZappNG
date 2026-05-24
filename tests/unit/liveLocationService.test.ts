import { describe, expect, it } from 'vitest';

import { buildLiveLocationPayload } from '../../lib/live-location/payload';
import { LIVE_LOCATION_PUSHER_EVENT, jobLocationChannel } from '../../types/tracking';

describe('liveLocationService', () => {
  it('builds the canonical Pusher payload shape', () => {
    const timestamp = '2026-05-24T12:00:00.000Z';
    const payload = buildLiveLocationPayload(
      'job-123',
      { latitude: 13.7563, longitude: 100.5018 },
      timestamp,
    );

    expect(payload).toEqual({
      jobId: 'job-123',
      latitude: 13.7563,
      longitude: 100.5018,
      timestamp,
    });
  });

  it('uses the web channel and event naming conventions', () => {
    expect(jobLocationChannel('job-abc')).toBe('private-job-location-job-abc');
    expect(LIVE_LOCATION_PUSHER_EVENT).toBe('location-update');
  });
});

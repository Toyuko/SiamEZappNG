import type { Coordinates } from '../geo/distance';
import type { LiveLocationBroadcastPayload } from '../../types/tracking';

/** Builds the canonical Pusher payload for `location-update`. */
export function buildLiveLocationPayload(
  jobId: string,
  coordinates: Coordinates,
  timestamp?: string,
): LiveLocationBroadcastPayload {
  return {
    jobId,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    timestamp: timestamp ?? new Date().toISOString(),
  };
}

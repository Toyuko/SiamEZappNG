import { api, type ApiEnvelope, unwrapApiData } from '../lib/api';
import type { Coordinates } from '../lib/geo/distance';
import { buildLiveLocationPayload } from '../lib/live-location/payload';
import type {
  EndLiveTransitRequest,
  EndLiveTransitResponse,
  LiveLocationBroadcastPayload,
  PostJobLocationRequest,
  PostJobLocationResponse,
} from '../types/tracking';

export { buildLiveLocationPayload } from '../lib/live-location/payload';
export { LIVE_LOCATION_PUSHER_EVENT, jobLocationChannel } from '../types/tracking';
export type { LiveLocationBroadcastPayload } from '../types/tracking';

/**
 * Posts a live coordinate while in transit. Sets `isCurrentlyInTransit` on the job
 * and triggers a Pusher `location-update` event with {@link LiveLocationBroadcastPayload}.
 */
export async function broadcastLiveLocation(
  jobId: string,
  coordinates: Coordinates,
): Promise<LiveLocationBroadcastPayload> {
  const payload = buildLiveLocationPayload(jobId, coordinates);

  const body: PostJobLocationRequest = {
    latitude: payload.latitude,
    longitude: payload.longitude,
    timestamp: payload.timestamp,
    inTransit: true,
  };

  const response = await api.post<PostJobLocationResponse | ApiEnvelope<PostJobLocationResponse>>(
    `/api/freelancer/jobs/${encodeURIComponent(jobId)}/location`,
    body,
  );

  unwrapApiData(response);
  return payload;
}

/**
 * Ends live transit — sets `isCurrentlyInTransit` to `false` so the web map stops
 * subscribing to Pusher and falls back to static milestone markers.
 */
export async function endLiveTransit(
  jobId: string,
  lastCoordinates?: Coordinates | null,
): Promise<EndLiveTransitResponse> {
  const body: EndLiveTransitRequest = {};

  if (lastCoordinates) {
    const payload = buildLiveLocationPayload(jobId, lastCoordinates);
    body.latitude = payload.latitude;
    body.longitude = payload.longitude;
    body.timestamp = payload.timestamp;
  }

  const response = await api.put<EndLiveTransitResponse | ApiEnvelope<EndLiveTransitResponse>>(
    `/api/freelancer/jobs/${encodeURIComponent(jobId)}/location`,
    body,
  );

  return unwrapApiData(response);
}

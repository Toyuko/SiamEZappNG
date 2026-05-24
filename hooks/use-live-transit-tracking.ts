import { useCallback, useEffect, useRef, useState } from 'react';

import {
  broadcastLiveLocation,
  endLiveTransit,
} from '../services/liveLocationService';
import {
  captureCurrentPositionAsync,
  distanceInMeters,
  LIVE_TRANSIT_MIN_DISTANCE_METERS,
  watchPositionAsync,
  type Coordinates,
} from '../services/locationService';

export function useLiveTransitTracking(jobId: string) {
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const lastSentRef = useRef<Coordinates | null>(null);
  const lastKnownRef = useRef<Coordinates | null>(null);
  const activeRef = useRef(false);

  const stopWatching = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    lastSentRef.current = null;
    activeRef.current = false;
    setActive(false);
  }, []);

  const sendLocationUpdate = useCallback(
    async (coordinates: Coordinates) => {
      lastKnownRef.current = coordinates;

      if (
        lastSentRef.current &&
        distanceInMeters(lastSentRef.current, coordinates) < LIVE_TRANSIT_MIN_DISTANCE_METERS
      ) {
        return;
      }

      lastSentRef.current = coordinates;

      try {
        await broadcastLiveLocation(jobId, coordinates);
      } catch {
        // Live updates are best-effort; manual milestones still work.
      }
    },
    [jobId],
  );

  const setLiveTransitActive = useCallback(
    async (next: boolean) => {
      if (!next) {
        const last = lastKnownRef.current;
        stopWatching();
        setBusy(true);
        try {
          await endLiveTransit(jobId, last);
        } catch {
          // Still clear local state so the freelancer can retry.
        } finally {
          setBusy(false);
          lastKnownRef.current = null;
        }
        return;
      }

      setBusy(true);
      try {
        const stop = await watchPositionAsync({
          onPosition: (coordinates) => {
            void sendLocationUpdate(coordinates);
          },
        });

        if (!stop) {
          return;
        }

        stopRef.current = stop;
        activeRef.current = true;
        setActive(true);

        // Do not await — a slow/failed API must not block the toggle UI.
        void captureCurrentPositionAsync().then((initial) => {
          if (initial) {
            void sendLocationUpdate(initial);
          }
        });
      } finally {
        setBusy(false);
      }
    },
    [jobId, sendLocationUpdate, stopWatching],
  );

  useEffect(() => {
    return () => {
      if (activeRef.current) {
        void endLiveTransit(jobId, lastKnownRef.current);
      }
      stopRef.current?.();
    };
  }, [jobId]);

  return {
    liveTransitActive: active,
    liveTransitBusy: busy,
    setLiveTransitActive,
  };
}

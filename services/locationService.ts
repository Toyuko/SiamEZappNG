import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

import type { Coordinates } from '../lib/geo/distance';
import { t } from '../lib/i18n/i18n';

export type { Coordinates } from '../lib/geo/distance';
export { distanceInMeters } from '../lib/geo/distance';

export const LIVE_TRANSIT_INTERVAL_MS = 15_000;
export const LIVE_TRANSIT_MIN_DISTANCE_METERS = 50;

function isNativePlatform() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function promptLocationRationale(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(t('tracking.locationPermissionTitle'), t('tracking.locationPermissionMessage'), [
      {
        text: t('tracking.locationPermissionNotNow'),
        style: 'cancel',
        onPress: () => resolve(false),
      },
      {
        text: t('tracking.locationPermissionContinue'),
        onPress: () => resolve(true),
      },
    ]);
  });
}

function promptOpenSettings() {
  Alert.alert(t('tracking.locationPermissionTitle'), t('tracking.locationPermissionBlocked'), [
    { text: t('tracking.locationPermissionNotNow'), style: 'cancel' },
    {
      text: t('tracking.locationOpenSettings'),
      onPress: () => void Linking.openSettings(),
    },
  ]);
}

function promptPermissionDenied() {
  Alert.alert(t('tracking.locationPermissionTitle'), t('tracking.locationPermissionDenied'), [
    { text: t('common.back'), style: 'cancel' },
  ]);
}

/**
 * Requests foreground location access with a rationale dialog.
 * Returns false when denied so callers can fall back to manual updates.
 */
export async function ensureForegroundLocationAccess(): Promise<boolean> {
  if (!isNativePlatform()) {
    return false;
  }

  const existing = await Location.getForegroundPermissionsAsync();
  if (existing.granted) {
    return true;
  }

  if (!existing.canAskAgain) {
    promptOpenSettings();
    return false;
  }

  const shouldRequest = await promptLocationRationale();
  if (!shouldRequest) {
    return false;
  }

  const result = await Location.requestForegroundPermissionsAsync();
  if (result.granted) {
    return true;
  }

  if (!result.canAskAgain) {
    promptOpenSettings();
  } else {
    promptPermissionDenied();
  }

  return false;
}

/** Captures a one-time GPS fix for milestone updates. Returns null when unavailable. */
export async function captureCurrentPositionAsync(): Promise<Coordinates | null> {
  if (!isNativePlatform()) {
    return null;
  }

  const granted = await ensureForegroundLocationAccess();
  if (!granted) {
    return null;
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    Alert.alert(t('tracking.locationPermissionTitle'), t('tracking.locationCaptureFailed'));
    return null;
  }
}

type WatchPositionOptions = {
  onPosition: (coordinates: Coordinates) => void;
  onError?: (error: Error) => void;
};

/**
 * Watches device position every {@link LIVE_TRANSIT_INTERVAL_MS}.
 * Caller is responsible for throttling downstream API calls.
 */
export async function watchPositionAsync(options: WatchPositionOptions): Promise<(() => void) | null> {
  if (!isNativePlatform()) {
    return null;
  }

  const granted = await ensureForegroundLocationAccess();
  if (!granted) {
    return null;
  }

  try {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: LIVE_TRANSIT_INTERVAL_MS,
        distanceInterval: 0,
      },
      (position) => {
        options.onPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
    );

    return () => subscription.remove();
  } catch (err) {
    options.onError?.(err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}

import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

let cached: NotificationsModule | null | undefined;
let didWarn = false;

/**
 * Android Expo Go (SDK 53+) throws while evaluating `expo-notifications`,
 * because remote push calls `addPushTokenListener` at import time.
 */
export function isAndroidExpoGo(): boolean {
  return Platform.OS === 'android' && isRunningInExpoGo();
}

/** `null` when importing `expo-notifications` would crash the app. */
export function getNotifications(): NotificationsModule | null {
  if (cached !== undefined) {
    return cached;
  }

  if (isAndroidExpoGo()) {
    cached = null;
    if (typeof __DEV__ !== 'undefined' && __DEV__ && !didWarn) {
      didWarn = true;
      console.warn(
        '[push] Remote notifications are unavailable in Android Expo Go. Use a development build to test push.',
      );
    }
    return cached;
  }

  // Required lazily so the package's import-time push listener never runs in Android Expo Go.
  cached = require('expo-notifications') as NotificationsModule;
  return cached;
}

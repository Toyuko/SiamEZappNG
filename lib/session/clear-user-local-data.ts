import AsyncStorage from '@react-native-async-storage/async-storage';

import { BOOKING_DRAFT_PREFIX } from '../../features/bookings/booking-drafts';

export const CONCIERGE_JOURNEY_KEY = '@siamez/concierge-journey/v1';
export const REVIEW_STORAGE_PREFIXES = ['@siamez/job-review/submitted/', '@siamez/job-review/dismissed/'] as const;

const USER_SCOPED_PREFIXES = [BOOKING_DRAFT_PREFIX, ...REVIEW_STORAGE_PREFIXES];

/** Removes booking drafts, concierge journey, and job-review flags from AsyncStorage. */
export async function clearUserLocalData() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const toRemove = keys.filter(
      (key) => key === CONCIERGE_JOURNEY_KEY || USER_SCOPED_PREFIXES.some((prefix) => key.startsWith(prefix)),
    );
    if (toRemove.length > 0) {
      await AsyncStorage.multiRemove(toRemove);
    }
  } catch {
    // Best-effort local wipe — session token is still cleared by the caller.
  }
}

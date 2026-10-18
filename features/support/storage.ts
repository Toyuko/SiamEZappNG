import AsyncStorage from '@react-native-async-storage/async-storage';

/** Chatwoot React Native widget cookie key (see @chatwoot/react-native-widget/src/utils.js). */
export const CHATWOOT_COOKIE_KEY = 'cwCookie';

/** Install-scoped guest id for support chat while not authenticated. */
export const SUPPORT_GUEST_ID_KEY = '@siamez/support/guest-id/v1';

function createGuestId(): string {
  const random =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `g-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return random;
}

/** Stable guest id for the current install (created once). */
export async function getOrCreateSupportGuestId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(SUPPORT_GUEST_ID_KEY);
    if (existing?.trim()) {
      return existing.trim();
    }
    const next = createGuestId();
    await AsyncStorage.setItem(SUPPORT_GUEST_ID_KEY, next);
    return next;
  } catch {
    return createGuestId();
  }
}

/**
 * Clear Chatwoot widget local identity so the next user on this device
 * cannot inherit the previous contact cookie. Does not delete server conversations.
 */
export async function clearChatwootLocalIdentity(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHATWOOT_COOKIE_KEY);
  } catch {
    // best-effort
  }
}

/**
 * Full support session teardown on logout / account switch.
 * Keeps the install-level guest id so anonymous reopen still works after logout.
 */
export async function resetSupportLocalSession(): Promise<void> {
  await clearChatwootLocalIdentity();
}

import * as SecureStore from 'expo-secure-store';

import type { UserRole } from '../../store/auth-store';

const ROLE_KEY = 'siamez_user_role';

let inMemoryRole: UserRole | null | undefined;

async function safeSecureStore(
  action: () => Promise<string | null | void>,
): Promise<string | null | void> {
  try {
    return await action();
  } catch {
    // expo-secure-store has no web implementation; memory cache still works for the session.
    return null;
  }
}

export async function saveUserRole(role: UserRole) {
  inMemoryRole = role;
  await safeSecureStore(() => SecureStore.setItemAsync(ROLE_KEY, role));
}

export async function getUserRole(): Promise<UserRole | null> {
  if (inMemoryRole !== undefined) {
    return inMemoryRole;
  }
  const stored = (await safeSecureStore(() => SecureStore.getItemAsync(ROLE_KEY))) as
    | string
    | null;
  inMemoryRole =
    stored === 'client' || stored === 'freelancer' || stored === 'corporate' ? stored : null;
  return inMemoryRole;
}

export async function clearUserRole() {
  inMemoryRole = null;
  await safeSecureStore(() => SecureStore.deleteItemAsync(ROLE_KEY));
}

import * as SecureStore from 'expo-secure-store';

import type { UserRole } from '../../store/auth-store';

const ROLE_KEY = 'siamez_user_role';

let inMemoryRole: UserRole | null | undefined;

export async function saveUserRole(role: UserRole) {
  inMemoryRole = role;
  await SecureStore.setItemAsync(ROLE_KEY, role);
}

export async function getUserRole(): Promise<UserRole | null> {
  if (inMemoryRole !== undefined) {
    return inMemoryRole;
  }
  const stored = await SecureStore.getItemAsync(ROLE_KEY);
  inMemoryRole = stored === 'client' || stored === 'freelancer' ? stored : null;
  return inMemoryRole;
}

export async function clearUserRole() {
  inMemoryRole = null;
  await SecureStore.deleteItemAsync(ROLE_KEY);
}

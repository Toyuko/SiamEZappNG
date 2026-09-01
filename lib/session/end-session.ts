import { clearUserRole } from '../storage/user-role-storage';
import { clearAccessToken } from '../storage/session-storage';
import { getAppQueryClient } from '../query/query-client';
import { useAuthStore } from '../../store/auth-store';
import { unregisterPushTokenFromBackend } from '../../services/notificationService';
import { clearUserLocalData } from './clear-user-local-data';

/**
 * Full session teardown for logout and authenticated 401s.
 * Clears token, role, Zustand session, React Query cache, and local PII.
 */
export async function endSession() {
  try {
    await unregisterPushTokenFromBackend();
  } catch {
    // best-effort — continue teardown
  }
  await Promise.all([clearAccessToken(), clearUserRole(), clearUserLocalData()]);
  getAppQueryClient().clear();
  useAuthStore.getState().clearSession();
}

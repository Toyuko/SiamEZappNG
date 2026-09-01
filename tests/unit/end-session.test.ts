import { beforeEach, describe, expect, it, vi } from 'vitest';

const multiRemove = vi.fn();
const getAllKeys = vi.fn();
const clearAccessToken = vi.fn();
const clearUserRole = vi.fn();
const clearSession = vi.fn();
const queryClear = vi.fn();
const unregisterPushTokenFromBackend = vi.fn();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getAllKeys: () => getAllKeys(),
    multiRemove: (keys: string[]) => multiRemove(keys),
  },
}));

vi.mock('../../lib/storage/session-storage', () => ({
  clearAccessToken: () => clearAccessToken(),
}));

vi.mock('../../lib/storage/user-role-storage', () => ({
  clearUserRole: () => clearUserRole(),
}));

vi.mock('../../lib/query/query-client', () => ({
  getAppQueryClient: () => ({ clear: queryClear }),
}));

vi.mock('../../store/auth-store', () => ({
  useAuthStore: {
    getState: () => ({ clearSession }),
  },
}));

vi.mock('../../services/notificationService', () => ({
  unregisterPushTokenFromBackend: () => unregisterPushTokenFromBackend(),
}));

describe('endSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAllKeys.mockResolvedValue([
      '@booking-draft:visa-services',
      '@siamez/concierge-journey/v1',
      '@siamez/job-review/submitted/job-1',
      'siamez-theme',
    ]);
    multiRemove.mockResolvedValue(undefined);
    clearAccessToken.mockResolvedValue(undefined);
    clearUserRole.mockResolvedValue(undefined);
    unregisterPushTokenFromBackend.mockResolvedValue(undefined);
  });

  it('clears token, role, query cache, local PII, and zustand session', async () => {
    const { endSession } = await import('../../lib/session/end-session');
    await endSession();

    expect(unregisterPushTokenFromBackend).toHaveBeenCalledTimes(1);
    expect(clearAccessToken).toHaveBeenCalledTimes(1);
    expect(clearUserRole).toHaveBeenCalledTimes(1);
    expect(multiRemove).toHaveBeenCalledWith([
      '@booking-draft:visa-services',
      '@siamez/concierge-journey/v1',
      '@siamez/job-review/submitted/job-1',
    ]);
    expect(queryClear).toHaveBeenCalledTimes(1);
    expect(clearSession).toHaveBeenCalledTimes(1);
  });
});

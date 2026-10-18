import { beforeEach, describe, expect, it, vi } from 'vitest';

const removeItem = vi.fn();
const getItem = vi.fn();
const setItem = vi.fn();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    removeItem: (key: string) => removeItem(key),
    getItem: (key: string) => getItem(key),
    setItem: (key: string, value: string) => setItem(key, value),
  },
}));

describe('Chatwoot session cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    removeItem.mockResolvedValue(undefined);
    getItem.mockResolvedValue(null);
    setItem.mockResolvedValue(undefined);
  });

  it('clears Chatwoot cookie on local identity reset (logout)', async () => {
    const { clearChatwootLocalIdentity, CHATWOOT_COOKIE_KEY } = await import(
      '../../features/support/storage'
    );
    await clearChatwootLocalIdentity();
    expect(removeItem).toHaveBeenCalledWith(CHATWOOT_COOKIE_KEY);
  });

  it('creates a stable guest id once', async () => {
    getItem.mockResolvedValueOnce(null).mockResolvedValueOnce('existing-guest');
    const { getOrCreateSupportGuestId, SUPPORT_GUEST_ID_KEY } = await import(
      '../../features/support/storage'
    );

    const first = await getOrCreateSupportGuestId();
    expect(setItem).toHaveBeenCalledWith(SUPPORT_GUEST_ID_KEY, first);
    expect(first.length).toBeGreaterThan(4);

    const second = await getOrCreateSupportGuestId();
    expect(second).toBe('existing-guest');
  });

  it('resets support chat store on account switch helpers', async () => {
    const { useSupportChatStore } = await import('../../features/support/support-chat-store');
    useSupportChatStore.getState().open({
      context: { source: 'contact', service: 'general' },
      user: { identifier: 'siamez_customer_old', email: 'old@x.com', name: 'Old' },
      customAttributes: { customer_type: 'client' },
    });
    expect(useSupportChatStore.getState().isVisible).toBe(true);

    useSupportChatStore.getState().reset();
    expect(useSupportChatStore.getState()).toMatchObject({
      isVisible: false,
      context: null,
      user: null,
      customAttributes: null,
    });
  });
});

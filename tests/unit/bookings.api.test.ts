import { beforeEach, describe, expect, it, vi } from 'vitest';

const postMock = vi.fn();

vi.mock('../../lib/api', () => ({
  unwrapApiData: <T>(value: T) => {
    if (value && typeof value === 'object' && 'data' in (value as object)) {
      return (value as unknown as { data: T }).data;
    }
    return value;
  },
  api: { post: postMock },
}));

describe('createBooking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('posts the website booking contract and unwraps the envelope', async () => {
    const { createBooking } = await import('../../features/bookings/bookings.api');
    postMock.mockResolvedValueOnce({
      success: true,
      data: { caseId: 'c-1', caseNumber: 'SEZ-1001', guestCheckoutToken: 'tok' },
    });

    const result = await createBooking({
      serviceId: 'translation-services',
      guestName: 'Ann',
      guestEmail: 'ann@example.com',
      guestPhone: '+66000000000',
      formData: { notes: 'hi' },
      documentIds: ['d-1'],
    });

    expect(postMock).toHaveBeenCalledWith('/api/bookings', {
      serviceId: 'translation-services',
      guestName: 'Ann',
      guestEmail: 'ann@example.com',
      guestPhone: '+66000000000',
      formData: { notes: 'hi' },
      documentIds: ['d-1'],
    });
    expect(result.caseNumber).toBe('SEZ-1001');
    expect(result.guestCheckoutToken).toBe('tok');
  });
});

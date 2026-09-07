import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/config', () => ({
  appConfig: {
    apiUrl: 'https://siam-ez.com',
    webBaseUrl: 'https://siam-ez.com',
    appName: 'SiamEZ',
  },
}));

describe('buildGuestCheckoutUrl', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('puts the guest token in the query string (website contract)', async () => {
    const { buildGuestCheckoutUrl } = await import('../../lib/bookings/guest-checkout');
    expect(
      buildGuestCheckoutUrl({
        caseId: 'case_abc',
        guestCheckoutToken: 'tok_xyz',
      }),
    ).toBe('https://siam-ez.com/checkout/case_abc?token=tok_xyz');
  });

  it('encodes the case id path segment', async () => {
    const { buildGuestCheckoutUrl } = await import('../../lib/bookings/guest-checkout');
    expect(
      buildGuestCheckoutUrl({
        caseId: 'a/b',
        guestCheckoutToken: 't o k',
      }),
    ).toBe('https://siam-ez.com/checkout/a%2Fb?token=t+o+k');
  });

  it('omits the token when missing (authenticated website session)', async () => {
    const { buildGuestCheckoutUrl } = await import('../../lib/bookings/guest-checkout');
    expect(buildGuestCheckoutUrl({ caseId: 'case_1' })).toBe(
      'https://siam-ez.com/checkout/case_1',
    );
  });

  it('canOpenGuestCheckout requires both case id and token', async () => {
    const { canOpenGuestCheckout } = await import('../../lib/bookings/guest-checkout');
    expect(canOpenGuestCheckout({ caseId: 'c1', guestCheckoutToken: 't1' })).toBe(true);
    expect(canOpenGuestCheckout({ caseId: 'c1', guestCheckoutToken: '  ' })).toBe(false);
    expect(canOpenGuestCheckout({ caseId: '', guestCheckoutToken: 't1' })).toBe(false);
  });
});

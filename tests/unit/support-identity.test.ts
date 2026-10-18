import { describe, expect, it } from 'vitest';

import {
  AUTHENTICATED_IDENTIFIER_PREFIX,
  GUEST_IDENTIFIER_PREFIX,
  authenticatedChatwootIdentifier,
  buildChatwootUser,
  guestChatwootIdentifier,
  resolveCustomerType,
} from '../../features/support/identity';

describe('Chatwoot identity', () => {
  it('builds a stable authenticated identifier from customer id (not email)', () => {
    expect(authenticatedChatwootIdentifier('user-42')).toBe(`${AUTHENTICATED_IDENTIFIER_PREFIX}user-42`);
    const user = buildChatwootUser({
      accessToken: 'jwt',
      isGuest: false,
      user: {
        id: 'user-42',
        email: 'jane@example.com',
        name: 'Jane Doe',
        phone: '+66812345678',
        role: 'customer',
      },
      userRole: 'client',
      guestProfile: { name: 'Guest', email: 'g@example.com', phone: '01' },
      guestId: 'guest-should-be-ignored',
    });
    expect(user).toEqual({
      identifier: `${AUTHENTICATED_IDENTIFIER_PREFIX}user-42`,
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone_number: '+66812345678',
    });
  });

  it('does not overwrite authenticated identity with guest profile data', () => {
    const user = buildChatwootUser({
      accessToken: 'jwt',
      isGuest: false,
      user: { id: 'u1', email: 'a@siam-ez.com', name: 'Auth Name' },
      userRole: 'client',
      guestProfile: { name: 'Guest Name', email: 'guest@x.com', phone: '999' },
      guestId: 'g1',
    });
    expect(user?.name).toBe('Auth Name');
    expect(user?.email).toBe('a@siam-ez.com');
    expect(user?.phone_number).toBeUndefined();
  });

  it('builds guest identity from guest id + optional guest profile', () => {
    const user = buildChatwootUser({
      accessToken: null,
      isGuest: true,
      user: null,
      userRole: null,
      guestProfile: { name: 'Guest User', email: 'guest@example.com', phone: '0812345678' },
      guestId: 'abc-123',
    });
    expect(user).toEqual({
      identifier: `${GUEST_IDENTIFIER_PREFIX}abc-123`,
      name: 'Guest User',
      email: 'guest@example.com',
      phone_number: '0812345678',
    });
    expect(guestChatwootIdentifier('abc-123')).toBe(`${GUEST_IDENTIFIER_PREFIX}abc-123`);
  });

  it('returns null for guests without a guest id', () => {
    expect(
      buildChatwootUser({
        accessToken: null,
        isGuest: true,
        user: null,
        userRole: null,
        guestProfile: null,
        guestId: null,
      }),
    ).toBeNull();
  });

  it('resolves customer_type for guest vs roles', () => {
    expect(
      resolveCustomerType({
        isGuest: true,
        accessToken: null,
        userRole: null,
        user: null,
      }),
    ).toBe('guest');
    expect(
      resolveCustomerType({
        isGuest: false,
        accessToken: 't',
        userRole: 'freelancer',
        user: { id: '1', email: 'f@x.com' },
      }),
    ).toBe('freelancer');
  });
});

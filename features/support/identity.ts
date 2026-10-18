import type { AuthUser, GuestProfile, UserRole } from '../../store/auth-store';
import type { ChatwootUserProps } from './types';

export const AUTHENTICATED_IDENTIFIER_PREFIX = 'siamez_customer_';
export const GUEST_IDENTIFIER_PREFIX = 'siamez_guest_';

export function authenticatedChatwootIdentifier(customerId: string): string {
  return `${AUTHENTICATED_IDENTIFIER_PREFIX}${customerId.trim()}`;
}

export function guestChatwootIdentifier(guestId: string): string {
  return `${GUEST_IDENTIFIER_PREFIX}${guestId.trim()}`;
}

function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim();
  return local && local.length > 0 ? local : 'SiamEZ Customer';
}

export type BuildChatwootUserInput = {
  accessToken: string | null;
  isGuest: boolean;
  user: AuthUser | null;
  userRole: UserRole | null;
  guestProfile: GuestProfile | null;
  /** Stable install/session guest id from AsyncStorage (required for guests). */
  guestId: string | null;
};

/**
 * Map SiamEZ auth state → Chatwoot website-widget user props.
 * Authenticated customers always win over guest data (no merge/overwrite).
 */
export function buildChatwootUser(input: BuildChatwootUserInput): ChatwootUserProps | null {
  const isAuthenticated = Boolean(input.accessToken) && !input.isGuest && Boolean(input.user?.id);

  if (isAuthenticated && input.user) {
    const email = input.user.email?.trim();
    const name =
      input.user.name?.trim() ||
      (email ? displayNameFromEmail(email) : undefined) ||
      'SiamEZ Customer';
    const phone = input.user.phone?.trim();

    const props: ChatwootUserProps = {
      identifier: authenticatedChatwootIdentifier(input.user.id),
      name,
    };
    if (email) {
      props.email = email;
    }
    if (phone) {
      props.phone_number = phone;
    }
    return props;
  }

  if (!input.guestId?.trim()) {
    return null;
  }

  const guest = input.guestProfile;
  const email = guest?.email?.trim();
  const name = guest?.name?.trim() || (email ? displayNameFromEmail(email) : 'SiamEZ Guest');
  const phone = guest?.phone?.trim();

  const props: ChatwootUserProps = {
    identifier: guestChatwootIdentifier(input.guestId),
    name,
  };
  if (email) {
    props.email = email;
  }
  if (phone) {
    props.phone_number = phone;
  }
  return props;
}

export function resolveCustomerType(input: {
  isGuest: boolean;
  accessToken: string | null;
  userRole: UserRole | null;
  user: AuthUser | null;
}): string {
  if (input.isGuest || !input.accessToken) {
    return 'guest';
  }
  if (input.userRole) {
    return input.userRole;
  }
  const role = input.user?.role?.toLowerCase();
  if (role === 'freelancer') return 'freelancer';
  if (role === 'corporate' || role === 'company') return 'corporate';
  return 'client';
}

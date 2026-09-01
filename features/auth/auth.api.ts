import { ApiError, api, type ApiEnvelope, unwrapApiData } from '../../lib/api';
import type { AuthUser } from '../../store/auth-store';

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type SignUpPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  /** Matches SiamEZ web `accountType` on POST /api/auth/register */
  accountType?: 'customer' | 'freelancer' | 'corporate';
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeSignUpPayload(payload: SignUpPayload): SignUpPayload {
  const normalizedPhone = payload.phone?.trim();
  return {
    ...payload,
    name: payload.name.trim(),
    email: normalizeEmail(payload.email),
    phone: normalizedPhone ? normalizedPhone : undefined,
    accountType: payload.accountType ?? 'customer',
  };
}

export async function loginWithEmail(payload: LoginPayload) {
  const normalizedPayload: LoginPayload = {
    ...payload,
    email: normalizeEmail(payload.email),
    password: payload.password.trim(),
  };
  const data = await api.post<
    LoginResponse | { accessToken: string; user: AuthUser } | ApiEnvelope<LoginResponse | { accessToken: string; user: AuthUser }>
  >('/api/auth/login', normalizedPayload);
  const normalized = unwrapApiData<LoginResponse | { accessToken: string; user: AuthUser }>(data);
  // Support both {token} and legacy {accessToken}
  if ('accessToken' in normalized) {
    return { token: normalized.accessToken, user: normalized.user };
  }
  return normalized;
}

export async function getMe(accessToken?: string) {
  const response = await api.get<AuthUser | ApiEnvelope<AuthUser>>(
    '/api/auth/me',
    accessToken ? { tokenOverride: accessToken } : undefined,
  );
  return unwrapApiData<AuthUser>(response);
}

export async function signUpWithEmail(payload: SignUpPayload) {
  const normalizedPayload = normalizeSignUpPayload(payload);
  const data = await api.post<
    LoginResponse | { accessToken: string; user: AuthUser } | ApiEnvelope<LoginResponse | { accessToken: string; user: AuthUser }>
  >('/api/auth/register', normalizedPayload);

  const normalized = unwrapApiData<LoginResponse | { accessToken: string; user: AuthUser }>(data);
  if ('accessToken' in normalized) {
    return { token: normalized.accessToken, user: normalized.user };
  }
  return normalized;
}

export async function attachGuestCasesToUser(email: string, userId: string) {
  const payload = { email, userId, isGuest: false };
  const candidatePaths = ['/api/cases/attach-guest', '/cases/attach-guest', '/api/auth/upgrade-guest-cases', '/auth/upgrade-guest-cases'];

  for (const path of candidatePaths) {
    try {
      await api.post<unknown>(path, payload);
      return;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        continue;
      }
      throw error;
    }
  }
}

import { ApiError, api } from '../../lib/api';
import type { AuthUser } from '../../store/auth-store';

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

function isNotFound(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

export async function loginWithEmail(payload: LoginPayload) {
  let data: LoginResponse | { accessToken: string; user: AuthUser };
  try {
    data = await api.post<LoginResponse | { accessToken: string; user: AuthUser }>('/api/auth/login', payload);
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
    data = await api.post<LoginResponse | { accessToken: string; user: AuthUser }>('/auth/login', payload);
  }
  // Support both {token} and legacy {accessToken}
  if ('accessToken' in data) {
    return { token: data.accessToken, user: data.user };
  }
  return data;
}

export async function getMe(accessToken?: string) {
  try {
    return await api.get<AuthUser>('/api/auth/me', accessToken ? { tokenOverride: accessToken } : undefined);
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
    return api.get<AuthUser>('/auth/me', accessToken ? { tokenOverride: accessToken } : undefined);
  }
}

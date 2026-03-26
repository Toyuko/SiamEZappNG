import { apiClient } from '../../lib/api/client';
import type { AuthUser } from '../../store/auth-store';

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export async function loginWithEmail(payload: LoginPayload) {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
  return data;
}

export async function getMe(accessToken?: string) {
  const { data } = await apiClient.get<AuthUser>('/auth/me', {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  return data;
}

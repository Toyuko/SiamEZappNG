import { api, unwrapApiData, type ApiEnvelope } from '../api';
import type { AuthUser } from '../../store/auth-store';

export { parseOAuthRedirect, type OAuthRedirectResult } from './oauth-redirect';

export async function exchangeOAuthCode(code: string, redirectUri: string) {
  const data = await api.post<
    | { token: string; user: AuthUser }
    | { accessToken: string; user: AuthUser }
    | ApiEnvelope<{ token: string; user: AuthUser } | { accessToken: string; user: AuthUser }>
  >('/api/auth/oauth/exchange', { code, redirectUri });
  const normalized = unwrapApiData(data);
  if ('accessToken' in normalized) {
    return { token: normalized.accessToken, user: normalized.user };
  }
  return normalized;
}

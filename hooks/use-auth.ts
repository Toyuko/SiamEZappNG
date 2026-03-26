import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

import { attachGuestCasesToUser, getMe, loginWithEmail, signUpWithEmail, type LoginPayload, type SignUpPayload } from '../features/auth/auth.api';
import { appConfig } from '../lib/config';
import { clearAccessToken, getAccessToken, saveAccessToken } from '../lib/storage/session-storage';
import { useAuthStore } from '../store/auth-store';

WebBrowser.maybeCompleteAuthSession();

export function useAuth() {
  const { setSession, enterGuestMode, clearSession, setBootstrapping } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => loginWithEmail(payload),
    onSuccess: async ({ token, user }) => {
      await saveAccessToken(token);
      setSession({ accessToken: token, user });
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (payload: SignUpPayload) => {
      const result = await signUpWithEmail(payload);
      try {
        await attachGuestCasesToUser(payload.email, result.user.id);
      } catch {
        // Keep registration successful even if optional guest-link endpoint is unavailable.
      }
      return result;
    },
    onSuccess: async ({ token, user }) => {
      await saveAccessToken(token);
      setSession({ accessToken: token, user });
    },
  });

  const loginWithProvider = useCallback(async (provider: 'google' | 'facebook' | 'line') => {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'siamez' });
    const url = `${appConfig.webBaseUrl}/auth/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`;
    const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);

    if (result.type === 'success' && result.url) {
      const parsedUrl = new URL(result.url);
      const token = parsedUrl.searchParams.get('accessToken');
      if (token) {
        await saveAccessToken(token);
        const user = await getMe(token);
        setSession({ accessToken: token, user });
      }
    }
  }, [setSession]);

  const bootstrapSession = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        return;
      }
      const user = await getMe(token);
      setSession({ accessToken: token, user });
    } catch {
      await clearAccessToken();
      clearSession();
    } finally {
      setBootstrapping(false);
    }
  }, [clearSession, setBootstrapping, setSession]);

  const logout = useCallback(async () => {
    await clearAccessToken();
    clearSession();
  }, [clearSession]);

  const continueAsGuest = useCallback(() => {
    enterGuestMode();
  }, [enterGuestMode]);

  return {
    loginMutation,
    signUpMutation,
    loginWithProvider,
    bootstrapSession,
    logout,
    continueAsGuest,
  };
}

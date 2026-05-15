import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

import {
  attachGuestCasesToUser,
  getMe,
  loginWithEmail,
  signUpWithEmail,
  type LoginPayload,
  type SignUpPayload,
} from '../features/auth/auth.api';
import { mapApiRoleToUserRole } from '../lib/auth/role';
import { appConfig } from '../lib/config';
import { clearAccessToken, getAccessToken, saveAccessToken } from '../lib/storage/session-storage';
import { clearUserRole, getUserRole, saveUserRole } from '../lib/storage/user-role-storage';
import type { AuthUser } from '../store/auth-store';
import { useAuthStore, type UserRole } from '../store/auth-store';

WebBrowser.maybeCompleteAuthSession();

async function resolveUserRole(user: AuthUser, storedRole: UserRole | null) {
  return mapApiRoleToUserRole(user.role) ?? storedRole;
}

export function useAuth() {
  const { setSession, enterGuestMode, clearSession, setBootstrapping } = useAuthStore();

  const applySession = useCallback(
    async (token: string, user: AuthUser) => {
      await saveAccessToken(token);
      const storedRole = await getUserRole();
      const userRole = await resolveUserRole(user, storedRole);
      if (userRole) {
        await saveUserRole(userRole);
      }
      setSession({ accessToken: token, user, userRole });
    },
    [setSession],
  );

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => loginWithEmail(payload),
    onSuccess: async ({ token, user }) => {
      await applySession(token, user);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (payload: SignUpPayload) => {
      const result = await signUpWithEmail(payload);
      if (payload.accountType !== 'freelancer') {
        try {
          await attachGuestCasesToUser(payload.email, result.user.id);
        } catch {
          // Keep registration successful even if optional guest-link endpoint is unavailable.
        }
      }
      return result;
    },
    onSuccess: async ({ token, user }) => {
      await applySession(token, user);
    },
  });

  const loginWithProvider = useCallback(
    async (provider: 'google' | 'facebook' | 'line') => {
      const redirectUri = AuthSession.makeRedirectUri({ scheme: 'siamez' });
      const url = `${appConfig.webBaseUrl}/auth/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`;
      const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);

      if (result.type === 'success' && result.url) {
        const parsedUrl = new URL(result.url);
        const token = parsedUrl.searchParams.get('accessToken');
        if (token) {
          const user = await getMe(token);
          await applySession(token, user);
        }
      }
    },
    [applySession],
  );

  const bootstrapSession = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        return;
      }
      const user = await getMe(token);
      await applySession(token, user);
    } catch {
      await clearAccessToken();
      await clearUserRole();
      clearSession();
    } finally {
      setBootstrapping(false);
    }
  }, [applySession, clearSession, setBootstrapping]);

  const logout = useCallback(async () => {
    await clearAccessToken();
    await clearUserRole();
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

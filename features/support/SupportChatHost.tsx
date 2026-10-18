import ChatWootWidget from '@chatwoot/react-native-widget';
import { useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';

import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';
import { resolveChatwootConfig } from './config';
import { clearChatwootLocalIdentity } from './storage';
import { useSupportChatStore } from './support-chat-store';

/**
 * Single app-wide Chatwoot host. Mount once from app/_layout.tsx.
 * Entry points must call openSupportChat() — never import the widget elsewhere.
 */
export function SupportChatHost() {
  const config = useMemo(() => resolveChatwootConfig(), []);
  const isVisible = useSupportChatStore((s) => s.isVisible);
  const user = useSupportChatStore((s) => s.user);
  const customAttributes = useSupportChatStore((s) => s.customAttributes);
  const close = useSupportChatStore((s) => s.close);
  const reset = useSupportChatStore((s) => s.reset);
  const language = useLanguageStore((s) => s.language);
  const { isDark } = useTheme();

  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const isGuest = useAuthStore((s) => s.isGuest);
  const previousIdentityRef = useRef<string | null>(null);

  // When the signed-in customer changes (or auth ↔ guest), drop widget cookie + close.
  useEffect(() => {
    const identityKey = accessToken && !isGuest && userId ? `auth:${userId}` : isGuest ? 'guest' : 'anon';
    const previous = previousIdentityRef.current;
    previousIdentityRef.current = identityKey;

    if (previous && previous !== identityKey) {
      reset();
      void clearChatwootLocalIdentity();
    }
  }, [accessToken, isGuest, reset, userId]);

  if (!config.enabled || Platform.OS === 'web') {
    return null;
  }

  if (!isVisible || !user) {
    return null;
  }

  return (
    <ChatWootWidget
      websiteToken={config.websiteToken}
      baseUrl={config.baseUrl}
      locale={language === 'th' ? 'th' : 'en'}
      colorScheme={isDark ? 'dark' : 'light'}
      isModalVisible={isVisible}
      closeModal={close}
      // Widget typings omit phone_number / identifier; runtime website SDK accepts them.
      user={user as { identifier?: string; name?: string; email?: string; avatar_url?: string }}
      customAttributes={customAttributes ?? {}}
    />
  );
}

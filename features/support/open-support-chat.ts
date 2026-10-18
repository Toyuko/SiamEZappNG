import NetInfo from '@react-native-community/netinfo';
import { Alert, Linking, Platform } from 'react-native';

import { appConfig } from '../../lib/config';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { useAuthStore } from '../../store/auth-store';
import { resolveChatwootConfig } from './config';
import { buildChatwootCustomAttributes } from './context';
import { buildChatwootUser, resolveCustomerType } from './identity';
import { getOrCreateSupportGuestId } from './storage';
import { useSupportChatStore } from './support-chat-store';
import type { OpenSupportChatOptions } from './types';

let lastOpenOptions: OpenSupportChatOptions | null = null;

async function ensureOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    if (state.isConnected === false) {
      Alert.alert(t('support.offlineTitle'), t('support.offlineMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('support.retry'),
          onPress: () => {
            if (lastOpenOptions) {
              void openSupportChat(lastOpenOptions);
            }
          },
        },
      ]);
      return false;
    }
  } catch {
    // If NetInfo fails, allow open and let WebView surface errors.
  }
  return true;
}

/**
 * Public entry point for "Chat with SiamEZ".
 * Builds identity + context, then opens the single root SupportChatHost modal.
 */
export async function openSupportChat(options: OpenSupportChatOptions): Promise<void> {
  lastOpenOptions = options;

  const config = resolveChatwootConfig();
  if (!config.enabled) {
    Alert.alert(t('support.unavailableTitle'), t('support.unavailableMessage'));
    if (__DEV__) {
      console.warn('[support]', config.message, config.reason);
    }
    return;
  }

  if (!(await ensureOnline())) {
    return;
  }

  // Web: official RN widget is not reliable on RN-web — fall back to website contact.
  if (Platform.OS === 'web') {
    const url = `${appConfig.webBaseUrl.replace(/\/+$/, '')}/contact`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('support.unavailableTitle'), t('support.unavailableMessage'));
    }
    return;
  }

  const auth = useAuthStore.getState();
  const language = useLanguageStore.getState().language;

  let guestId: string | null = null;
  const isAuthenticated = Boolean(auth.accessToken) && !auth.isGuest && Boolean(auth.user?.id);
  if (!isAuthenticated) {
    guestId = await getOrCreateSupportGuestId();
  }

  const user = buildChatwootUser({
    accessToken: auth.accessToken,
    isGuest: auth.isGuest || !isAuthenticated,
    user: auth.user,
    userRole: auth.userRole,
    guestProfile: auth.guestProfile,
    guestId,
  });

  if (!user) {
    Alert.alert(t('support.unavailableTitle'), t('support.identityError'));
    return;
  }

  const customerType = resolveCustomerType({
    isGuest: auth.isGuest || !isAuthenticated,
    accessToken: auth.accessToken,
    userRole: auth.userRole,
    user: auth.user,
  });

  const customAttributes = buildChatwootCustomAttributes({
    context: options,
    language,
    customerType,
    customerId: isAuthenticated ? auth.user?.id : null,
    role: auth.userRole ?? auth.user?.role ?? null,
  });

  useSupportChatStore.getState().open({
    context: options,
    user,
    customAttributes,
  });
}

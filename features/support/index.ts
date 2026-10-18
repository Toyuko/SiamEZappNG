export { resolveChatwootConfig, isChatwootEnabled } from './config';
export {
  mapToSupportServiceKey,
  buildChatwootCustomAttributes,
  supportContextFromServiceSlug,
} from './context';
export {
  buildChatwootUser,
  authenticatedChatwootIdentifier,
  guestChatwootIdentifier,
  resolveCustomerType,
} from './identity';
export { openSupportChat } from './open-support-chat';
export { SupportChatButton } from './SupportChatButton';
export { SupportChatHost } from './SupportChatHost';
export { useSupportChatStore } from './support-chat-store';
export {
  clearChatwootLocalIdentity,
  resetSupportLocalSession,
  getOrCreateSupportGuestId,
  CHATWOOT_COOKIE_KEY,
  SUPPORT_GUEST_ID_KEY,
} from './storage';
export type {
  SupportServiceKey,
  SupportSource,
  SupportChatContext,
  OpenSupportChatOptions,
  ChatwootUserProps,
  ChatwootCustomAttributes,
} from './types';

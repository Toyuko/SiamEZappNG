import { create } from 'zustand';

import type { ChatwootCustomAttributes, ChatwootUserProps, SupportChatContext } from './types';

type SupportChatState = {
  isVisible: boolean;
  context: SupportChatContext | null;
  user: ChatwootUserProps | null;
  customAttributes: ChatwootCustomAttributes | null;
  open: (payload: {
    context: SupportChatContext;
    user: ChatwootUserProps;
    customAttributes: ChatwootCustomAttributes;
  }) => void;
  close: () => void;
  /** Hard reset without opening (logout / identity change). */
  reset: () => void;
};

export const useSupportChatStore = create<SupportChatState>((set) => ({
  isVisible: false,
  context: null,
  user: null,
  customAttributes: null,
  open: ({ context, user, customAttributes }) =>
    set({
      isVisible: true,
      context,
      user,
      customAttributes,
    }),
  close: () => set({ isVisible: false }),
  reset: () =>
    set({
      isVisible: false,
      context: null,
      user: null,
      customAttributes: null,
    }),
}));

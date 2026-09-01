import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '../../lib/theme/tokens';
import { LoginPhoneFrame } from './LoginPhoneFrame';
import { useAuthColors } from './auth-ui';

type AuthScreenLayoutProps = {
  children: ReactNode;
  footer?: ReactNode;
};

/** Shared scrollable auth shell — light page background, centered content, web phone frame. */
export function AuthScreenLayout({ children, footer }: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const { pageBackground } = useAuthColors();

  return (
    <LoginPhoneFrame>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: pageBackground }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 4 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: spacing.screenPaddingX,
            paddingTop: Platform.OS === 'web' ? spacing.sectionGap : Math.max(insets.top, spacing.sectionGap),
            paddingBottom: spacing.sectionGap + insets.bottom,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          {children}
          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
    </LoginPhoneFrame>
  );
}

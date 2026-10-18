import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Button } from '../../components/ui/Button';
import { t } from '../../lib/i18n/i18n';
import { useTheme } from '../../lib/theme/theme';
import { isChatwootEnabled } from './config';
import { openSupportChat } from './open-support-chat';
import type { OpenSupportChatOptions } from './types';

type SupportChatButtonProps = {
  context: OpenSupportChatOptions;
  /** `primary` = full Button; `row` = profile-style list row. */
  variant?: 'primary' | 'secondary' | 'row';
  label?: string;
  subtitle?: string;
};

export function SupportChatButton({
  context,
  variant = 'primary',
  label,
  subtitle,
}: SupportChatButtonProps) {
  const { colors } = useTheme();
  const enabled = isChatwootEnabled();
  const title = label ?? t('support.chatWithSiamEZ');

  if (!enabled) {
    return null;
  }

  const onPress = () => {
    void openSupportChat(context);
  };

  if (variant === 'row') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        className="flex-row items-center gap-3 py-3"
        style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
      >
        <View
          className="h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
        >
          <Ionicons name="chatbubbles-outline" size={18} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-0.5 text-xs leading-4" style={{ color: colors.muted }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
    );
  }

  return (
    <Button
      label={title}
      variant={variant === 'secondary' ? 'secondary' : 'primary'}
      onPress={onPress}
    />
  );
}

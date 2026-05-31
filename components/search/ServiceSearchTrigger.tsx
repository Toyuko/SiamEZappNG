import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ServiceSearchModal } from './ServiceSearchModal';
import { t } from '../../lib/i18n/i18n';
import { radius } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type ServiceSearchTriggerProps = {
  /** Override placeholder text */
  placeholder?: string;
  /** Optional label above the trigger */
  label?: string;
  /** Wrap in card-style container */
  variant?: 'default' | 'inline';
};

export function ServiceSearchTrigger({
  placeholder,
  label,
  variant = 'default',
}: ServiceSearchTriggerProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const trigger = (
    <Pressable
      onPress={() => setOpen(true)}
      accessibilityRole="button"
      accessibilityLabel={placeholder ?? t('search.openSearch')}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 52,
        borderRadius: radius.button,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        paddingHorizontal: 14,
      })}
    >
      <Ionicons name="search" size={20} color={colors.muted} />
      <Text className="ml-2.5 flex-1 text-base" style={{ color: colors.muted }} numberOfLines={1}>
        {placeholder ?? t('search.placeholder')}
      </Text>
      <Ionicons name="mic-outline" size={20} color={colors.primary} />
    </Pressable>
  );

  return (
    <>
      {variant === 'inline' ? (
        trigger
      ) : (
        <View style={{ gap: label ? 6 : 0 }}>
          {label ? (
            <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
              {label}
            </Text>
          ) : null}
          {trigger}
        </View>
      )}
      <ServiceSearchModal visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

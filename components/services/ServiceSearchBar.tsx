import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Keyboard, Pressable, TextInput, View } from 'react-native';

import { ServiceSearchModal } from '../search/ServiceSearchModal';
import { t } from '../../lib/i18n/i18n';
import { radius } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type ServiceSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function ServiceSearchBar({ value, onChangeText, placeholder }: ServiceSearchBarProps) {
  const { colors } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        inputRef.current?.blur();
        Keyboard.dismiss();
      };
    }, []),
  );

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 52,
          borderRadius: radius.button,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          paddingHorizontal: 14,
          gap: 8,
        }}
      >
        <Ionicons name="search" size={20} color={colors.muted} />
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? t('services.searchPlaceholder')}
          placeholderTextColor={colors.muted}
          accessibilityLabel={t('search.openSearch')}
          returnKeyType="search"
          clearButtonMode="while-editing"
          style={{
            flex: 1,
            fontSize: 16,
            color: colors.foreground,
            paddingVertical: 10,
          }}
        />
        <Pressable
          onPress={() => setModalOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={t('search.voiceSearch')}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Ionicons name="mic-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>
      <ServiceSearchModal visible={modalOpen} onClose={() => setModalOpen(false)} initialQuery={value} />
    </>
  );
}

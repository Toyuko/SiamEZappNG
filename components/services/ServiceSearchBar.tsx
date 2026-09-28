import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { getServiceTitle } from '../../features/services/service-display';
import { fuzzySearchServicesWithScores } from '../../features/services/service-search';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { ServiceSearchModal } from '../search/ServiceSearchModal';

type ServiceSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Overrides the field fill. Use this instead of a parent opacity, which blocks typing on Android. */
  backgroundColor?: string;
};

export function ServiceSearchBar({ value, onChangeText, placeholder, backgroundColor }: ServiceSearchBarProps) {
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
          backgroundColor: backgroundColor ?? colors.card,
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

type ServiceSearchResultsProps = {
  query: string;
};

export function ServiceSearchResults({ query }: ServiceSearchResultsProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const trimmed = query.trim();
  const results = useMemo(
    () => (trimmed.length > 0 ? fuzzySearchServicesWithScores(trimmed, 6).map((hit) => hit.item) : []),
    [trimmed],
  );

  if (trimmed.length === 0) {
    return null;
  }

  const openResult = (slug: string) => {
    Keyboard.dismiss();
    router.push(`/services/${slug}`);
  };

  return (
    <View
      pointerEvents="auto"
      style={{
        maxHeight: 280,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        overflow: 'hidden',
        zIndex: 30,
        elevation: 12,
      }}
    >
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        {results.length === 0 ? (
          <Text style={{ paddingHorizontal: 14, paddingVertical: 16, fontSize: 15, color: colors.muted }}>
            {t('search.emptyTitle')}
          </Text>
        ) : (
          results.map((item) => {
            const title = getServiceTitle(item, language);
            return (
              <Pressable
                key={item.slug}
                onPress={() => openResult(item.slug)}
                accessibilityRole="button"
                accessibilityLabel={title}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.88 : 1,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                })}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }} numberOfLines={1}>
                  {title}
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

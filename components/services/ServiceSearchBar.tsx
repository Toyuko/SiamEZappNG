import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { getCategoryLabel, getServiceDescription, getServiceTitle } from '../../features/services/service-display';
import { fuzzySearchServicesWithScores } from '../../features/services/service-search';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, shadows } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { ServiceSearchModal } from '../search/ServiceSearchModal';
import { SERVICE_ICON_SURFACE } from './service-icon-surface';

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
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const trimmed = query.trim();
  const results = useMemo(
    () => (trimmed.length > 0 ? fuzzySearchServicesWithScores(trimmed, 4).map((hit) => hit.item) : []),
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
      style={[
        {
          maxHeight: 320,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          overflow: 'hidden',
          zIndex: 30,
        },
        isDark ? shadows.cardDarkMedium : shadows.cardMedium,
      ]}
    >
      <Text style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, fontSize: 12, fontWeight: '600', color: colors.muted }}>
        {results.length === 0 ? t('search.emptyTitle') : t('search.resultCount', { count: results.length })}
      </Text>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ padding: 8, gap: 6 }}>
        {results.length === 0 ? (
          <Text style={{ paddingHorizontal: 8, paddingBottom: 12, fontSize: 14, lineHeight: 20, color: colors.muted }}>
            {t('search.emptyHint')}
          </Text>
        ) : (
          results.map((item) => {
            const title = getServiceTitle(item, language);
            const description = getServiceDescription(item, language);
            const tint = SERVICE_ICON_SURFACE[item.category][isDark ? 'dark' : 'light'];
            return (
              <Pressable
                key={item.slug}
                onPress={() => openResult(item.slug)}
                accessibilityRole="button"
                accessibilityLabel={`${title}. ${t('services.viewDetails')}`}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.9 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  borderRadius: radius.lg,
                  backgroundColor: pressed ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(44,84,198,0.06)') : 'transparent',
                })}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: tint,
                  }}
                >
                  <Ionicons name={item.icon} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground }} numberOfLines={1}>
                    {title}
                  </Text>
                  <Text style={{ marginTop: 2, fontSize: 13, lineHeight: 18, color: colors.muted }} numberOfLines={1}>
                    {description}
                  </Text>
                  <Text style={{ marginTop: 3, fontSize: 12, fontWeight: '600', color: colors.primary }} numberOfLines={1}>
                    {getCategoryLabel(item.category)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

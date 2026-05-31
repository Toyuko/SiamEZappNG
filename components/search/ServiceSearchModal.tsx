import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useServiceFuzzySearch } from '../../hooks/use-service-fuzzy-search';
import { useVoiceSearch } from '../../hooks/use-voice-search';
import { t } from '../../lib/i18n/i18n';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import type { ServiceItem } from '../../features/services/services.data';

const ICON_SURFACE: Record<ServiceItem['category'], { light: string; dark: string }> = {
  Legal: { light: 'rgba(44, 84, 198, 0.14)', dark: 'rgba(91, 118, 224, 0.26)' },
  Translation: { light: 'rgba(91, 118, 224, 0.12)', dark: 'rgba(91, 118, 224, 0.22)' },
  Mobility: { light: 'rgba(44, 84, 198, 0.1)', dark: 'rgba(91, 118, 224, 0.2)' },
  Business: { light: 'rgba(255, 206, 45, 0.22)', dark: 'rgba(255, 206, 45, 0.16)' },
  Concierge: { light: 'rgba(44, 84, 198, 0.12)', dark: 'rgba(91, 118, 224, 0.22)' },
};

type ServiceSearchModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Optional initial query when opening (e.g. from voice on trigger) */
  initialQuery?: string;
};

export function ServiceSearchModal({ visible, onClose, initialQuery = '' }: ServiceSearchModalProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const { query, setQuery, results, hasQuery } = useServiceFuzzySearch('');

  const handleTranscript = useCallback(
    (text: string) => {
      setQuery(text);
    },
    [setQuery],
  );

  const { isListening, interimTranscript, startListening, abortListening } = useVoiceSearch({
    onTranscript: handleTranscript,
  });

  useEffect(() => {
    if (visible) {
      setQuery(initialQuery);
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
    abortListening();
    setQuery('');
    return undefined;
  }, [visible, initialQuery, abortListening, setQuery]);

  const handleClose = useCallback(() => {
    abortListening();
    onClose();
  }, [abortListening, onClose]);

  const handleSelect = useCallback(
    (slug: string) => {
      handleClose();
      router.push(`/services/${slug}`);
    },
    [handleClose, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: ServiceItem }) => {
      const tint = ICON_SURFACE[item.category][isDark ? 'dark' : 'light'];
      return (
        <Pressable
          onPress={() => handleSelect(item.slug)}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}. ${t('services.viewDetails')}`}
          style={({ pressed }) => ({
            opacity: pressed ? 0.88 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.stackMd,
            paddingVertical: spacing.stackMd,
            paddingHorizontal: spacing.stackSm,
            borderRadius: radius.lg,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          })}
        >
          <View
            className="h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: tint }}
          >
            <Ionicons name={item.icon} size={24} color={colors.primary} accessibilityIgnoresInvertColors />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-base font-semibold leading-5" style={{ color: colors.foreground }} numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="mt-0.5 text-sm leading-5" style={{ color: colors.muted }} numberOfLines={2}>
              {item.shortDescription}
            </Text>
            <Text className="mt-1 text-xs font-medium" style={{ color: colors.primary }}>
              {item.category}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      );
    },
    [colors, handleSelect, isDark],
  );

  const keyExtractor = useCallback((item: ServiceItem) => item.slug, []);

  const listEmpty = (
    <View className="items-center px-4 py-12">
      <View
        className="mb-4 h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: isDark ? 'rgba(91, 118, 224, 0.2)' : 'rgba(44, 84, 198, 0.1)' }}
      >
        <Ionicons name="search-outline" size={28} color={colors.primary} />
      </View>
      <Text className="text-center text-lg font-bold" style={{ color: colors.foreground }}>
        {t('search.emptyTitle')}
      </Text>
      <Text className="mt-2 max-w-[280px] text-center text-sm leading-5" style={{ color: colors.muted }}>
        {t('search.emptyHint')}
      </Text>
    </View>
  );

  const displayQuery = isListening && interimTranscript ? interimTranscript : query;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleClose}>
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <View
            style={{
              paddingHorizontal: spacing.screenPaddingX,
              paddingTop: spacing.stackSm,
              paddingBottom: spacing.stackMd,
              gap: spacing.stackMd,
            }}
          >
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel={t('common.back')}
                hitSlop={8}
                style={{
                  minHeight: 44,
                  minWidth: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="arrow-back" size={24} color={colors.foreground} />
              </Pressable>
              <Text className="flex-1 text-lg font-bold" style={{ color: colors.foreground }}>
                {t('search.title')}
              </Text>
            </View>

            <View
              className="flex-row items-center"
              style={{
                borderColor: isListening ? colors.primary : colors.border,
                backgroundColor: colors.card,
                borderRadius: radius.button,
                borderWidth: isListening ? 2 : 1,
              }}
            >
              <View className="pl-3.5">
                <Ionicons name="search" size={20} color={colors.muted} />
              </View>
              <TextInput
                ref={inputRef}
                value={displayQuery}
                onChangeText={setQuery}
                placeholder={t('search.placeholder')}
                placeholderTextColor={colors.muted}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                editable={!isListening}
                className="min-h-[52px] flex-1 py-3.5 pl-2 pr-2 text-base"
                style={{ color: colors.foreground }}
              />
              <Pressable
                onPress={startListening}
                accessibilityRole="button"
                accessibilityLabel={isListening ? t('search.listening') : t('search.voiceSearch')}
                hitSlop={8}
                style={{
                  minHeight: 44,
                  minWidth: 44,
                  marginRight: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isListening ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="mic-outline" size={22} color={colors.primary} />
                )}
              </Pressable>
            </View>

            {isListening ? (
              <View
                className="flex-row items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ backgroundColor: isDark ? 'rgba(91, 118, 224, 0.18)' : 'rgba(44, 84, 198, 0.08)' }}
              >
                <View className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                  {t('search.listening')}
                </Text>
              </View>
            ) : null}

            {hasQuery ? (
              <Text className="text-sm" style={{ color: colors.muted }}>
                {t('search.resultCount', { count: results.length })}
              </Text>
            ) : (
              <Text className="text-sm" style={{ color: colors.muted }}>
                {t('search.hint')}
              </Text>
            )}
          </View>

          <FlatList
            data={results}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListEmptyComponent={hasQuery ? listEmpty : null}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            initialNumToRender={12}
            maxToRenderPerBatch={10}
            windowSize={7}
            contentContainerStyle={{
              paddingHorizontal: spacing.screenPaddingX,
              paddingBottom: spacing.sectionGapLg,
              gap: spacing.stackSm,
              flexGrow: 1,
            }}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

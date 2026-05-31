import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FuzzySearchHit } from '../../features/services/service-search';
import type { ServiceItem } from '../../features/services/services.data';
import { t } from '../../lib/i18n/i18n';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useVoiceFirst } from './VoiceFirstProvider';
import { VoiceWaveform } from './VoiceWaveform';

const ICON_SURFACE: Record<ServiceItem['category'], { light: string; dark: string }> = {
  Legal: { light: 'rgba(44, 84, 198, 0.14)', dark: 'rgba(91, 118, 224, 0.26)' },
  Translation: { light: 'rgba(91, 118, 224, 0.12)', dark: 'rgba(91, 118, 224, 0.22)' },
  Mobility: { light: 'rgba(44, 84, 198, 0.1)', dark: 'rgba(91, 118, 224, 0.2)' },
  Business: { light: 'rgba(255, 206, 45, 0.22)', dark: 'rgba(255, 206, 45, 0.16)' },
  Concierge: { light: 'rgba(44, 84, 198, 0.12)', dark: 'rgba(91, 118, 224, 0.22)' },
};

export function VoiceListeningSheet() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    sheetOpen,
    phase,
    isListening,
    liveTranscript,
    resultHits,
    errorMessage,
    closeSheet,
    cancelListening,
    finishListeningEarly,
    selectResult,
    retryListening,
  } = useVoiceFirst();

  const showWaveform = phase === 'listening' || isListening;
  const showResults = phase === 'results' && resultHits.length > 0;
  const showProcessing = phase === 'processing';

  const transcriptPreview =
    liveTranscript.trim().length > 0
      ? t('voice.listeningTranscript', { text: liveTranscript.trim() })
      : t('voice.listeningPrompt');

  const handleClose = useCallback(() => {
    cancelListening();
  }, [cancelListening]);

  const renderResult = useCallback(
    ({ item }: { item: FuzzySearchHit }) => {
      const service = item.item;
      const tint = ICON_SURFACE[service.category][isDark ? 'dark' : 'light'];
      return (
        <Pressable
          onPress={() => selectResult(service.slug)}
          accessibilityRole="button"
          accessibilityLabel={service.title}
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
            marginBottom: spacing.stackSm,
          })}
        >
          <View
            className="h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: tint }}
          >
            <Ionicons name={service.icon} size={22} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-base font-semibold" style={{ color: colors.foreground }} numberOfLines={1}>
              {service.title}
            </Text>
            <Text className="mt-0.5 text-sm" style={{ color: colors.muted }} numberOfLines={2}>
              {service.shortDescription}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      );
    },
    [colors, isDark, selectResult],
  );

  const keyExtractor = useCallback((item: FuzzySearchHit) => item.item.slug, []);

  return (
    <Modal visible={sheetOpen} transparent animationType="none" onRequestClose={handleClose}>
      <View className="flex-1">
        <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(180)} className="absolute inset-0">
          <BlurView
            intensity={Platform.OS === 'ios' ? 48 : 72}
            tint={isDark ? 'dark' : 'light'}
            style={{ flex: 1 }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('voice.close')}
            onPress={handleClose}
            style={{
              ...Platform.select({
                ios: {},
                default: { backgroundColor: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)' },
              }),
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.springify().damping(18)}
          exiting={SlideOutDown.duration(200)}
          style={{
            marginTop: 'auto',
            paddingBottom: Math.max(insets.bottom, 16),
            paddingHorizontal: spacing.screenPaddingX,
          }}
        >
          <View
            style={{
              borderRadius: radius.lg + 4,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              paddingTop: spacing.stackLg,
              paddingHorizontal: spacing.stackLg,
              paddingBottom: spacing.stackLg,
              maxHeight: '78%',
            }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                {showResults ? t('voice.chooseService') : t('voice.title')}
              </Text>
              <Pressable
                onPress={handleClose}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={t('voice.close')}
                style={{ minHeight: 40, minWidth: 40, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="close" size={24} color={colors.muted} />
              </Pressable>
            </View>

            <View className="items-center py-2">
              <View
                className="mb-4 h-20 w-20 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDark ? 'rgba(91, 118, 224, 0.22)' : 'rgba(44, 84, 198, 0.12)',
                }}
              >
                {showProcessing ? (
                  <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                  <Ionicons name="mic" size={36} color={colors.primary} />
                )}
              </View>
              <VoiceWaveform active={showWaveform && !showProcessing} />
            </View>

            <Text
              className="mt-2 text-center text-base leading-6"
              style={{ color: colors.foreground }}
              numberOfLines={3}
            >
              {showResults && liveTranscript.trim().length > 0
                ? t('voice.heard', { text: liveTranscript.trim() })
                : transcriptPreview}
            </Text>

            {errorMessage ? (
              <Text className="mt-3 text-center text-sm" style={{ color: '#b91c1c' }}>
                {errorMessage}
              </Text>
            ) : null}

            {showResults ? (
              <FlatList
                data={resultHits}
                keyExtractor={keyExtractor}
                renderItem={renderResult}
                style={{ marginTop: spacing.stackLg, maxHeight: 280 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              />
            ) : null}

            <View className="mt-5 flex-row gap-3">
              {isListening ? (
                <Pressable
                  onPress={finishListeningEarly}
                  accessibilityRole="button"
                  accessibilityLabel={t('voice.doneSpeaking')}
                  className="flex-1 items-center justify-center rounded-xl py-3.5"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-base font-semibold text-white">{t('voice.doneSpeaking')}</Text>
                </Pressable>
              ) : showResults ? (
                <Pressable
                  onPress={retryListening}
                  accessibilityRole="button"
                  accessibilityLabel={t('voice.tryAgain')}
                  className="flex-1 items-center justify-center rounded-xl border py-3.5"
                  style={{ borderColor: colors.border }}
                >
                  <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                    {t('voice.tryAgain')}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={closeSheet}
                  accessibilityRole="button"
                  accessibilityLabel={t('voice.close')}
                  className="flex-1 items-center justify-center rounded-xl border py-3.5"
                  style={{ borderColor: colors.border }}
                >
                  <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                    {t('voice.close')}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

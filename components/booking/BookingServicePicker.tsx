import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  getServiceDescription,
  getServiceTitle,
} from '../../features/services/service-display';
import { getServicePosterImageUrl } from '../../features/services/service-poster-images';
import type { ServiceItem } from '../../features/services/services.types';
import { trackFunnel } from '../../lib/analytics/funnel';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { motion } from '../../lib/theme/motion';
import { radius, shadows, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SERVICE_ACCENTS: Record<string, string> = {
  'marriage-registration': '#E11D48',
  'translation-services': '#7C3AED',
  'basic-translation-fixed-price': '#7C3AED',
  'driver-license': '#EA580C',
  'police-clearance': '#0647C7',
  'visa-services': '#0284C7',
  'construction-handyman': '#16A34A',
  'real-estate-services': '#DB2777',
  'car-motorbike-finding-selling': '#0D9488',
  'vehicle-registration': '#7C3AED',
  'transportation-services': '#0891B2',
  'private-driver-service': '#2563EB',
  'event-planning-venue-services': '#C026D3',
};

type BookingServicePickerProps = {
  services: ServiceItem[];
  onSelect: (slug: string) => void;
};

function ServicePickCard({
  service,
  onSelect,
}: {
  service: ServiceItem;
  onSelect: (slug: string) => void;
}) {
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((s) => s.language);
  const title = getServiceTitle(service, language);
  const description = getServiceDescription(service, language);
  const accent = SERVICE_ACCENTS[service.slug] ?? siam.blue.DEFAULT;
  const posterUrl = getServicePosterImageUrl(service.slug);
  const [posterFailed, setPosterFailed] = useState(false);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => {
        trackFunnel('booking_started', { slug: service.slug, source: 'book_picker' });
        onSelect(service.slug);
      }}
      onPressIn={() => {
        scale.value = withTiming(motion.pressScale, { duration: motion.cardPress });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: motion.cardPress });
      }}
      style={[
        animatedStyle,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          minHeight: 88,
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: isDark ? colors.card : '#FFFFFF',
          ...shadows.cardLight,
        },
      ]}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: accent,
        }}
      >
        <Ionicons name={service.icon} size={22} color="#FFFFFF" />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text className="text-[16px] font-bold" numberOfLines={1} style={{ color: colors.foreground }}>
          {title}
        </Text>
        <Text className="mt-1 text-sm leading-5" numberOfLines={2} style={{ color: colors.muted }}>
          {description}
        </Text>
      </View>

      {!posterFailed ? (
        <Image
          source={{ uri: posterUrl }}
          style={{ width: 56, height: 56, borderRadius: radius.md, backgroundColor: siam.blue.tint }}
          onError={() => setPosterFailed(true)}
        />
      ) : null}

      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : siam.blue.tint,
        }}
      >
        <Ionicons name="chevron-forward" size={18} color={siam.blue.DEFAULT} />
      </View>
    </AnimatedPressable>
  );
}

/**
 * Step 1 — visually rich service selection with search.
 */
export function BookingServicePicker({ services, onSelect }: BookingServicePickerProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter((item) => {
      const hay = [
        item.slug,
        item.titleEn,
        item.titleTh,
        item.descriptionEn,
        item.descriptionTh,
        item.category,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, services]);

  return (
    <View style={{ gap: spacing.stackMd }}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
          <View style={{ width: 4, height: 20, borderRadius: 999, backgroundColor: siam.yellow.DEFAULT }} />
          <View className="min-w-0 flex-1">
            <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
              {t('book.selectServiceTitle')}
            </Text>
            <Text className="mt-0.5 text-sm" style={{ color: colors.muted }}>
              {t('book.chooseServiceHint')}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 48,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          paddingHorizontal: 12,
          gap: 8,
        }}
      >
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('services.searchPlaceholder')}
          placeholderTextColor={colors.muted}
          accessibilityLabel={t('services.searchPlaceholder')}
          style={{ flex: 1, fontSize: 15, color: colors.foreground, paddingVertical: 10 }}
        />
      </View>

      <View style={{ gap: 10 }}>
        {filtered.map((service) => (
          <ServicePickCard key={service.slug} service={service} onSelect={onSelect} />
        ))}
        {filtered.length === 0 ? (
          <Text className="py-6 text-center text-sm" style={{ color: colors.muted }}>
            {t('services.noResults')}
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="link"
        onPress={() => router.push('/(tabs)/contact')}
        style={({ pressed }) => ({
          alignItems: 'center',
          paddingVertical: 10,
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Text className="text-sm font-semibold" style={{ color: siam.blue.DEFAULT }}>
          {t('book.notSureAsk')}
        </Text>
      </Pressable>
    </View>
  );
}

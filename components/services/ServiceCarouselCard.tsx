import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  getBadgeLabel,
  getServiceDescription,
  getServicePriceFrom,
  getServiceTitle,
} from '../../features/services/service-display';
import type { ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, shadows, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { SERVICE_BADGE_COLORS } from './service-badge-colors';
import {
  SERVICE_ICON_GRADIENT,
  SERVICE_ICON_GRADIENT_END,
  SERVICE_ICON_GRADIENT_START,
} from './service-icon-gradient';

const LINE_OFFICIAL_URL = 'https://line.me/R/ti/p/@siamez';

type ServiceCarouselCardProps = {
  service: ServiceItem;
  cardHeight: number;
};

export function ServiceCarouselCard({ service, cardHeight }: ServiceCarouselCardProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const title = getServiceTitle(service, language);
  const description = getServiceDescription(service, language);
  const priceLine = getServicePriceFrom(service);
  const gradient = SERVICE_ICON_GRADIENT[service.category];
  const heroHeight = Math.round(cardHeight * 0.34);
  const docCount = service.requirements?.length ?? 0;
  const shadowStyle = isDark ? shadows.cardDarkMedium : shadows.cardMedium;

  const openDetails = () => router.push(`/services/${service.slug}`);
  const openBook = () => router.push({ pathname: '/(tabs)/book', params: { serviceSlug: service.slug } });

  const openLine = async () => {
    const canOpen = await Linking.canOpenURL(LINE_OFFICIAL_URL);
    if (!canOpen) {
      Alert.alert(t('serviceDetail.cannotOpenLink'), t('serviceDetail.tryAgainLater'));
      return;
    }
    await Linking.openURL(LINE_OFFICIAL_URL);
  };

  return (
    <View
      style={{
        height: cardHeight,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        overflow: 'hidden',
        ...shadowStyle,
      }}
    >
      <View style={{ height: heroHeight, overflow: 'hidden' }}>
        <LinearGradient
          colors={[gradient.colors[0], gradient.colors[1], colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons
            name={service.icon}
            size={heroHeight * 0.55}
            color={gradient.foreground}
            style={{ opacity: 0.22 }}
            accessibilityIgnoresInvertColors
          />
        </LinearGradient>

        {service.badges.length > 0 ? (
          <View
            style={{
              position: 'absolute',
              left: spacing.stackMd,
              right: spacing.stackMd,
              bottom: spacing.stackSm,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            {service.badges.slice(0, 3).map((badge) => {
              const badgeColors = SERVICE_BADGE_COLORS[badge];
              return (
                <View
                  key={badge}
                  style={{
                    borderRadius: radius.full,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    backgroundColor: badgeColors.background,
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: '800', letterSpacing: 0.4, color: badgeColors.text }}>
                    {getBadgeLabel(badge).toUpperCase()}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>

      <View style={{ flex: 1, paddingHorizontal: spacing.cardPaddingCompact, paddingTop: spacing.stackSm, gap: 6 }}>
        <View className="flex-row items-center gap-2">
          <LinearGradient
            colors={[...gradient.colors]}
            start={SERVICE_ICON_GRADIENT_START}
            end={SERVICE_ICON_GRADIENT_END}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={service.icon} size={18} color={gradient.foreground} accessibilityIgnoresInvertColors />
          </LinearGradient>
          <Text className="flex-1 text-base font-bold leading-5" style={{ color: colors.foreground }} numberOfLines={2}>
            {title}
          </Text>
        </View>

        <Text className="text-xs leading-4" style={{ color: colors.muted }} numberOfLines={2}>
          {description}
        </Text>

        <View style={{ gap: 4 }}>
          {service.estimatedTime ? (
            <MetaRow icon="time-outline" label={t('services.processingTime')} value={service.estimatedTime} />
          ) : null}
          {docCount > 0 ? (
            <MetaRow
              icon="document-text-outline"
              label={t('services.documents')}
              value={t('services.documentCount', { count: docCount })}
            />
          ) : null}
          {priceLine ? (
            <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
              {priceLine}
            </Text>
          ) : null}
        </View>

        <View style={{ marginTop: 'auto', gap: 6, paddingBottom: spacing.stackSm }}>
          <View className="flex-row gap-2">
            <CarouselActionButton label={t('cta.bookNow')} primary onPress={openBook} />
            <CarouselActionButton label={t('services.viewDetails')} onPress={openDetails} />
          </View>
          <Pressable
            onPress={openLine}
            accessibilityRole="button"
            accessibilityLabel={t('services.lineOfficial')}
            style={({ pressed }) => ({
              minHeight: 34,
              borderRadius: radius.sm,
              borderWidth: 1.5,
              borderColor: '#06c755',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 6,
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Ionicons name="chatbubble-ellipses" size={14} color="#06c755" />
            <Text className="text-xs font-semibold" style={{ color: '#06c755' }}>
              {t('services.lineOfficial')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center gap-1.5">
      <Ionicons name={icon} size={13} color={colors.muted} />
      <Text className="text-[11px]" style={{ color: colors.muted }} numberOfLines={1}>
        <Text className="font-semibold">{label}: </Text>
        {value}
      </Text>
    </View>
  );
}

function CarouselActionButton({
  label,
  primary = false,
  onPress,
}: {
  label: string;
  primary?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 36,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        opacity: pressed ? 0.88 : 1,
        backgroundColor: primary ? colors.primary : colors.card,
        borderWidth: primary ? 0 : 1,
        borderColor: colors.primary,
      })}
    >
      <Text className="text-xs font-semibold" style={{ color: primary ? '#ffffff' : colors.primary }} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

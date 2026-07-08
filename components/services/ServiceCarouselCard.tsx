import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ServicePosterHero } from './ServicePosterHero';
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

type ServiceCarouselCardProps = {
  service: ServiceItem;
  cardHeight: number;
  cardWidth?: number;
  portrait?: boolean;
};

export function ServiceCarouselCard({
  service,
  cardHeight,
  cardWidth,
  portrait = false,
}: ServiceCarouselCardProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const title = getServiceTitle(service, language);
  const description = getServiceDescription(service, language);
  const priceLine = getServicePriceFrom(service);
  const gradient = SERVICE_ICON_GRADIENT[service.category];
  const shadowStyle = isDark ? shadows.cardDarkMedium : shadows.cardMedium;

  const openDetails = () => router.push(`/services/${service.slug}`);
  const openBook = () => router.push({ pathname: '/(tabs)/book', params: { serviceSlug: service.slug } });

  if (portrait && cardWidth != null) {
    const heroHeight = Math.round(cardHeight * 0.38);
    const bodyHeight = cardHeight - heroHeight;
    const footerPadding = spacing.stackSm;
    const buttonHeight = 34;
    const buttonGap = 6;
    const footerHeight = footerPadding + buttonHeight + buttonGap + buttonHeight + footerPadding;

    return (
      <View
        style={{
          width: cardWidth,
          height: cardHeight,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          overflow: 'hidden',
        }}
      >
        <ServicePosterHero service={service} width={cardWidth} height={heroHeight} />

        <View style={{ width: cardWidth, height: bodyHeight, position: 'relative', backgroundColor: colors.card }}>
          <View
            style={{
              paddingHorizontal: footerPadding,
              paddingTop: footerPadding,
              paddingBottom: footerHeight + footerPadding,
            }}
          >
            {service.badges.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                {service.badges.slice(0, 1).map((badge) => {
                  const badgeColors = SERVICE_BADGE_COLORS[badge];
                  return (
                    <View
                      key={badge}
                      style={{
                        borderRadius: radius.full,
                        paddingHorizontal: 5,
                        paddingVertical: 2,
                        backgroundColor: badgeColors.background,
                      }}
                    >
                      <Text style={{ fontSize: 7, fontWeight: '800', color: badgeColors.text }}>
                        {getBadgeLabel(badge).toUpperCase()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

            <Text
              style={{ fontSize: 11, fontWeight: '700', lineHeight: 14, color: colors.foreground }}
              numberOfLines={2}
            >
              {title}
            </Text>
            <Text
              style={{ fontSize: 9, lineHeight: 12, color: colors.muted, marginTop: 4 }}
              numberOfLines={2}
            >
              {description}
            </Text>
            {priceLine ? (
              <Text style={{ fontSize: 9, fontWeight: '600', color: colors.primary, marginTop: 4 }} numberOfLines={1}>
                {priceLine}
              </Text>
            ) : null}
          </View>

          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: footerHeight,
              paddingHorizontal: footerPadding,
              paddingBottom: footerPadding,
              paddingTop: footerPadding,
              backgroundColor: colors.card,
            }}
          >
            <View style={{ marginBottom: buttonGap }}>
              <CardActionButton label={t('cta.bookNow')} primary stacked onPress={openBook} />
            </View>
            <CardActionButton label={t('services.moreDetails')} stacked onPress={openDetails} />
          </View>
        </View>
      </View>
    );
  }

  const heroHeight = Math.round(cardHeight * 0.34);
  const docCount = service.requirements?.length ?? 0;

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
        <ServicePosterHero service={service} height={heroHeight} iconSize={heroHeight * 0.55} />

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
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <CardActionButton label={t('cta.bookNow')} primary onPress={openBook} />
            <CardActionButton label={t('services.viewDetails')} onPress={openDetails} />
          </View>
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

/** Website-style Book Now (filled) + More Details (outlined). */
function CardActionButton({
  label,
  primary = false,
  stacked = false,
  onPress,
}: {
  label: string;
  primary?: boolean;
  stacked?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const height = stacked ? 34 : 34;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: stacked ? '100%' : undefined,
        flex: stacked ? undefined : 1,
        height,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        opacity: pressed ? 0.88 : 1,
        backgroundColor: primary ? colors.primary : colors.card,
        borderWidth: primary ? 0 : 1.5,
        borderColor: colors.primary,
      })}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          color: primary ? '#ffffff' : colors.primary,
          textAlign: 'center',
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

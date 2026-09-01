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
import { radius, shadows, siam, spacing } from '../../lib/theme/tokens';
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

const PORTRAIT_BUTTON_HEIGHT = 26;
const PORTRAIT_BUTTON_GAP = 4;
/** Title, price, padding, and stacked CTAs below the image. */
const PORTRAIT_BODY_RESERVED_HEIGHT = 94;
const PORTRAIT_BODY_INSET = 5;

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
    const contentWidth = cardWidth - PORTRAIT_BODY_INSET * 2;
    const heroHeight = Math.max(cardHeight - PORTRAIT_BODY_RESERVED_HEIGHT, Math.round(cardHeight * 0.5));
    const bodyHeight = cardHeight - heroHeight;
    const buttonsBlockHeight = PORTRAIT_BUTTON_HEIGHT * 2 + PORTRAIT_BUTTON_GAP;
    const textBlockHeight =
      bodyHeight - PORTRAIT_BODY_INSET * 2 - buttonsBlockHeight - PORTRAIT_BUTTON_GAP;

    return (
      <View
        style={{
          width: cardWidth,
          height: cardHeight,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        <View style={{ width: cardWidth, height: heroHeight, overflow: 'hidden' }}>
          <ServicePosterHero service={service} width={cardWidth} height={heroHeight} />
          {service.badges.length > 0 ? (
            <View
              style={{
                position: 'absolute',
                left: PORTRAIT_BODY_INSET,
                bottom: PORTRAIT_BODY_INSET,
                flexDirection: 'row',
              }}
            >
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
        </View>

        <View
          style={{
            width: cardWidth,
            height: bodyHeight,
            paddingHorizontal: PORTRAIT_BODY_INSET,
            paddingTop: PORTRAIT_BODY_INSET,
            paddingBottom: PORTRAIT_BODY_INSET,
          }}
        >
          <View style={{ width: contentWidth, height: Math.max(0, textBlockHeight), overflow: 'hidden' }}>
            <Text
              style={{ fontSize: 9, fontWeight: '700', lineHeight: 12, color: colors.foreground }}
              numberOfLines={1}
            >
              {title}
            </Text>
            {priceLine ? (
              <Text style={{ fontSize: 8, fontWeight: '600', color: colors.primary, marginTop: 2 }} numberOfLines={1}>
                {priceLine}
              </Text>
            ) : null}
          </View>

          <View style={{ width: contentWidth, height: buttonsBlockHeight, marginTop: PORTRAIT_BUTTON_GAP }}>
            <PortraitCardButton
              label={t('cta.bookNow')}
              variant="primary"
              width={contentWidth}
              onPress={openBook}
            />
            <View style={{ height: PORTRAIT_BUTTON_GAP }} />
            <PortraitCardButton
              label={t('services.moreDetails')}
              variant="outline"
              width={contentWidth}
              onPress={openDetails}
            />
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

function PortraitCardButton({
  label,
  variant,
  width,
  onPress,
}: {
  label: string;
  variant: 'primary' | 'outline';
  width: number;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <View
      style={{
        width,
        height: PORTRAIT_BUTTON_HEIGHT,
        borderRadius: radius.sm,
        overflow: 'hidden',
        backgroundColor: isPrimary ? siam.blue.DEFAULT : colors.card,
        borderWidth: isPrimary ? 0 : 1.5,
        borderColor: siam.blue.DEFAULT,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => ({
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.88 : 1,
        })}
      >
        <Text
          style={{
            width: '100%',
            fontSize: 9,
            fontWeight: '700',
            textAlign: 'center',
            color: isPrimary ? '#ffffff' : siam.blue.DEFAULT,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

function CardActionButton({
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
        height: 34,
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

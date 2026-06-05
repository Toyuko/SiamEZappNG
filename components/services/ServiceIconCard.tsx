import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { getBadgeLabel, getServiceDescription, getServicePriceFrom, getServiceTitle } from '../../features/services/service-display';
import type { ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { SERVICE_ICON_SURFACE } from './service-icon-surface';

type ServiceIconCardProps = {
  service: ServiceItem;
  /** Compact grid card vs full-width list card */
  variant?: 'grid' | 'list';
};

export function ServiceIconCard({ service, variant = 'grid' }: ServiceIconCardProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const title = getServiceTitle(service, language);
  const description = getServiceDescription(service, language);
  const priceLine = getServicePriceFrom(service);
  const tint = SERVICE_ICON_SURFACE[service.category][isDark ? 'dark' : 'light'];
  const iconSize = variant === 'grid' ? 32 : 28;
  const iconBox = variant === 'grid' ? 72 : 56;

  const openDetails = () => router.push(`/services/${service.slug}`);
  const openBook = () => router.push({ pathname: '/(tabs)/book', params: { serviceSlug: service.slug } });

  return (
    <View style={variant === 'grid' ? { flex: 1, minWidth: 0 } : undefined}>
    <Card shadow="medium">
      <Pressable
        onPress={openDetails}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${t('services.viewDetails')}`}
        style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      >
        <View className={variant === 'grid' ? 'items-center' : 'flex-row gap-3'}>
          <View
            className="items-center justify-center"
            style={{
              width: iconBox,
              height: iconBox,
              borderRadius: radius.lg,
              backgroundColor: tint,
            }}
          >
            <Ionicons name={service.icon} size={iconSize} color={colors.primary} accessibilityIgnoresInvertColors />
          </View>

          <View className={variant === 'grid' ? 'mt-3 w-full items-center' : 'min-w-0 flex-1'}>
            <Text
              className={`font-bold leading-5 ${variant === 'grid' ? 'text-center text-sm' : 'text-base'}`}
              style={{ color: colors.foreground }}
              numberOfLines={2}
            >
              {title}
            </Text>
            <Text
              className={`mt-1.5 leading-5 ${variant === 'grid' ? 'text-center text-xs' : 'text-sm'}`}
              style={{ color: colors.muted }}
              numberOfLines={variant === 'grid' ? 2 : 3}
            >
              {description}
            </Text>

            {service.badges.length > 0 ? (
              <View className={`mt-2 flex-row flex-wrap gap-1.5 ${variant === 'grid' ? 'justify-center' : ''}`}>
                {service.badges.slice(0, 2).map((badge) => (
                  <View
                    key={badge}
                    className="rounded-full px-2 py-0.5"
                    style={{
                      backgroundColor: isDark ? 'rgba(91, 118, 224, 0.25)' : 'rgba(44, 84, 198, 0.1)',
                    }}
                  >
                    <Text className="text-[10px] font-semibold" style={{ color: colors.primary }}>
                      {getBadgeLabel(badge)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {priceLine ? (
              <Text
                className={`mt-2 font-semibold ${variant === 'grid' ? 'text-center text-xs' : 'text-sm'}`}
                style={{ color: colors.primary }}
              >
                {priceLine}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      <View style={{ marginTop: spacing.stackMd, gap: spacing.stackSm }}>
        <Button label={t('cta.bookNow')} size="md" onPress={openBook} />
        <Button label={t('services.viewDetails')} variant="secondary" size="md" onPress={openDetails} />
      </View>
    </Card>
    </View>
  );
}

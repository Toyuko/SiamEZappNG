import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Card } from '../ui/Card';
import { getBadgeLabel, getServiceDescription, getServicePriceFrom, getServiceTitle } from '../../features/services/service-display';
import type { ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import {
  SERVICE_ICON_GRADIENT,
  SERVICE_ICON_GRADIENT_END,
  SERVICE_ICON_GRADIENT_START,
} from './service-icon-gradient';

type ServiceIconCardProps = {
  service: ServiceItem;
  variant?: 'grid' | 'list';
};

export function ServiceIconCard({ service, variant = 'grid' }: ServiceIconCardProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const title = getServiceTitle(service, language);
  const description = getServiceDescription(service, language);
  const priceLine = getServicePriceFrom(service);
  const gradient = SERVICE_ICON_GRADIENT[service.category];
  const isGrid = variant === 'grid';

  const openDetails = () => router.push(`/services/${service.slug}`);
  const openBook = () => router.push({ pathname: '/(tabs)/book', params: { serviceSlug: service.slug } });

  return (
    <Card shadow="medium" compact={isGrid}>
      <Pressable
        onPress={openDetails}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${t('services.viewDetails')}`}
        style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      >
        <View className={isGrid ? '' : 'flex-row gap-3'}>
          <LinearGradient
            colors={[...gradient.colors]}
            start={SERVICE_ICON_GRADIENT_START}
            end={SERVICE_ICON_GRADIENT_END}
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: gradient.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.5 : 0.3,
              shadowRadius: 7,
              elevation: 4,
            }}
          >
            <Ionicons name={service.icon} size={isGrid ? 26 : 28} color={gradient.foreground} accessibilityIgnoresInvertColors />
          </LinearGradient>

          <View className={isGrid ? 'mt-2.5' : 'min-w-0 flex-1'} style={isGrid ? { width: '100%' } : undefined}>
            <Text
              className={`font-bold leading-4 ${isGrid ? 'text-[13px]' : 'text-base leading-5'}`}
              style={{ color: colors.foreground }}
              numberOfLines={2}
            >
              {title}
            </Text>
            <Text
              className={`mt-1 leading-4 ${isGrid ? 'text-[11px]' : 'text-sm leading-5'}`}
              style={{ color: colors.muted }}
              numberOfLines={isGrid ? 2 : 3}
            >
              {description}
            </Text>

            {service.badges.length > 0 ? (
              <View className="mt-1.5 flex-row flex-wrap gap-1">
                {service.badges.slice(0, 1).map((badge) => (
                  <View
                    key={badge}
                    className="rounded-full px-1.5 py-0.5"
                    style={{
                      backgroundColor: isDark ? 'rgba(91, 118, 224, 0.25)' : 'rgba(44, 84, 198, 0.1)',
                    }}
                  >
                    <Text className="text-[9px] font-semibold" style={{ color: colors.primary }}>
                      {getBadgeLabel(badge)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {priceLine ? (
              <Text className="mt-1.5 text-[11px] font-semibold" style={{ color: colors.primary }}>
                {priceLine}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      <View style={{ marginTop: spacing.stackSm, flexDirection: 'row', gap: 6 }}>
        <CompactActionButton label={t('cta.bookNow')} primary onPress={openBook} />
        <CompactActionButton label={t('services.viewDetails')} onPress={openDetails} />
      </View>
    </Card>
  );
}

function CompactActionButton({
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
        paddingHorizontal: 6,
        opacity: pressed ? 0.88 : 1,
        backgroundColor: primary ? colors.primary : colors.card,
        borderWidth: primary ? 0 : 1,
        borderColor: colors.primary,
      })}
    >
      <Text
        className="text-[11px] font-semibold"
        style={{ color: primary ? '#ffffff' : colors.primary }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  getServiceDescription,
  getServicePriceFrom,
  getServiceTitle,
} from '../../features/services/service-display';
import { getFeaturedServices } from '../../features/services/services.data';
import { trackFunnel } from '../../lib/analytics/funnel';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, shadows, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { Button } from '../ui/Button';
import { Section } from '../ui/Section';

type PopularServicesRowProps = {
  title: string;
  subtitle?: string;
};

export function PopularServicesRow({ title, subtitle }: PopularServicesRowProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const language = useLanguageStore((s) => s.language);
  const services = getFeaturedServices().slice(0, 6);

  if (services.length === 0) {
    return null;
  }

  return (
    <Section title={title} subtitle={subtitle}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: spacing.screenPaddingX }}
      >
        {services.map((service) => {
          const serviceTitle = getServiceTitle(service, language);
          const price = getServicePriceFrom(service);
          return (
            <Pressable
              key={service.slug}
              accessibilityRole="button"
              accessibilityLabel={serviceTitle}
              onPress={() => {
                trackFunnel('service_viewed', { slug: service.slug });
                router.push(`/services/${service.slug}`);
              }}
              style={({ pressed }) => ({
                width: 220,
                padding: spacing.cardPaddingCompact + 2,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                opacity: pressed ? 0.9 : 1,
                ...shadows.cardLight,
              })}
            >
              <View
                className="mb-2 self-start rounded-full px-2.5 py-1"
                style={{ backgroundColor: `${siam.yellow.DEFAULT}33` }}
              >
                <Text className="text-[10px] font-bold uppercase" style={{ color: '#8A6A00' }}>
                  {t('services.badgePopular')}
                </Text>
              </View>
              <Text className="text-base font-bold" numberOfLines={2} style={{ color: colors.foreground }}>
                {serviceTitle}
              </Text>
              <Text className="mt-1 text-xs leading-4" numberOfLines={2} style={{ color: colors.muted }}>
                {getServiceDescription(service, language)}
              </Text>
              {price ? (
                <Text className="mt-2 text-sm font-semibold" style={{ color: colors.primary }}>
                  {price}
                </Text>
              ) : null}
              <View className="mt-3">
                <Button
                  label={t('cta.bookNow')}
                  variant="accent"
                  gradient
                  size="md"
                  onPress={() => {
                    trackFunnel('booking_started', { slug: service.slug, source: 'home_popular' });
                    router.push({ pathname: '/(tabs)/book', params: { serviceSlug: service.slug } });
                  }}
                />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </Section>
  );
}

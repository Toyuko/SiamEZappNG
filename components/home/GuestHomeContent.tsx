import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { trackFunnel } from '../../lib/analytics/funnel';
import { t } from '../../lib/i18n/i18n';
import { useTheme } from '../../lib/theme/theme';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FadeInView } from '../ui/FadeInView';
import { BookingPromoBanner } from './BookingPromoBanner';
import { HomeHeader } from './HomeHeader';
import { HomeHero } from './HomeHero';
import { PopularServicesGrid } from './PopularServicesGrid';
import { TrustStrip } from './TrustStrip';

/**
 * Guest home — conversion-first: hero → trust → services → book again.
 */
export function GuestHomeContent() {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    trackFunnel('home_viewed', { audience: 'guest' });
  }, []);

  const openBook = (source: string) => {
    trackFunnel('booking_started', { source });
    router.push('/(tabs)/book');
  };

  return (
    <>
      <HomeHeader />

      <HomeHero
        badge={t('home.badge')}
        title={t('home.title')}
        subtitle={t('home.subtitle')}
        primaryLabel={t('home.bookService')}
        onPrimaryPress={() => openBook('home_hero')}
        secondaryLabel={t('home.browseServices')}
        onSecondaryPress={() => router.push('/(tabs)/services')}
      />

      <TrustStrip />

      <PopularServicesGrid title={t('home.whatDoYouNeed')} subtitle={t('home.chooseServiceHint')} />

      <BookingPromoBanner variant="promo" />

      <FadeInView delay={140}>
        <Card>
          <Text className="text-lg font-bold tracking-tight" style={{ color: colors.foreground }}>
            {t('home.readyTitle')}
          </Text>
          <Text className="mt-1.5 text-sm leading-5" style={{ color: colors.muted }}>
            {t('home.readySubtitle')}
          </Text>
          <View className="mt-4 gap-3">
            <Button
              label={t('home.bookService')}
              variant="accent"
              gradient
              onPress={() => openBook('home_ready_card')}
            />
            <Button
              label={t('home.askConcierge')}
              variant="secondary"
              onPress={() => {
                trackFunnel('support_contacted', { source: 'home_concierge' });
                router.push('/(tabs)/concierge');
              }}
            />
          </View>
        </Card>
      </FadeInView>
    </>
  );
}

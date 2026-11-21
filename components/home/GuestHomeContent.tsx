import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { trackFunnel } from '../../lib/analytics/funnel';
import { t } from '../../lib/i18n/i18n';
import { BookingPromoBanner } from './BookingPromoBanner';
import { HomeHeader } from './HomeHeader';
import { HomeHero } from './HomeHero';
import { PopularServicesGrid } from './PopularServicesGrid';
import { TrustStrip } from './TrustStrip';

/**
 * Guest home — conversion-first, matches screenshot hierarchy.
 */
export function GuestHomeContent() {
  const router = useRouter();

  useEffect(() => {
    trackFunnel('home_viewed', { audience: 'guest' });
  }, []);

  return (
    <>
      <HomeHeader />

      <HomeHero
        badge={t('home.badge')}
        title={t('home.title')}
        subtitle={t('home.subtitle')}
        primaryLabel={t('home.bookService')}
        onPrimaryPress={() => {
          trackFunnel('booking_started', { source: 'home_hero' });
          router.push('/(tabs)/book');
        }}
        secondaryLabel={t('home.browseServices')}
        onSecondaryPress={() => router.push('/(tabs)/services')}
      />

      <TrustStrip />

      <PopularServicesGrid title={t('home.whatDoYouNeed')} subtitle={t('home.chooseServiceHint')} />

      <BookingPromoBanner variant="promo" />
    </>
  );
}

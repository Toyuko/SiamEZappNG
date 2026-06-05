import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PageHeader } from '../../components/ui/PageHeader';
import { PopularServices } from '../../components/services/PopularServices';
import { ServiceSearchBar } from '../../components/services/ServiceSearchBar';
import { StickyServiceCTA } from '../../components/services/StickyServiceCTA';
import { SwipeCategoryPages } from '../../components/services/SwipeCategoryPages';
import { getFeaturedServices } from '../../features/services/services.data';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

/** Bottom inset so grid content clears sticky CTA + voice FAB */
const STICKY_CTA_CLEARANCE = 148;

export default function ServicesScreen() {
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const featuredServices = getFeaturedServices();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View
        className="flex-1"
        style={{
          paddingHorizontal: spacing.screenPaddingX,
          paddingTop: spacing.stackMd,
          paddingBottom: STICKY_CTA_CLEARANCE,
          gap: spacing.stackLg,
        }}
      >
        <PageHeader title={t('services.title')} subtitle={t('services.subtitle')} />

        <ServiceSearchBar value={searchQuery} onChangeText={setSearchQuery} />

        <PopularServices services={featuredServices} />

        <SwipeCategoryPages
          searchQuery={searchQuery}
          language={language}
          activeIndex={activeCategoryIndex}
          onActiveIndexChange={setActiveCategoryIndex}
        />
      </View>

      <StickyServiceCTA />
    </SafeAreaView>
  );
}
